// Route-level data loading.
//
// One wrapper per route. Each one requests only its own slice of content from
// /api/content, so visiting /roster no longer downloads the blog archive, the sponsor
// list and every site label along with it. Wrappers keep the presentational views
// unchanged apart from their (now much smaller) prop contracts.

import { lazy, useEffect, useState, type ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";

import { usePageContent, fetchPageContent, invalidateContent, type PageContentState } from "../utils/contentClient";
import { getDatabaseState } from "../utils/api";
import type {
  ActivityContent,
  BlogContent,
  ClubContent,
  DatabaseState,
  HomeContent,
  MemberEvent,
  MembershipContent,
  NewsItem,
  RosterContent,
  ScoresContent,
  SiteLabels,
  SiteSettings,
  SponsorsContent,
  StaffContent
} from "../types";

import HomeView from "../components/HomeView";
import BlogView from "../components/BlogView";
import AboutClubView from "../components/AboutClubView";
import ActivityDetailView from "../components/ActivityDetailView";
import RosterView from "../components/RosterView";
import StaffView from "../components/StaffView";
import ScoresView from "../components/ScoresView";
import SponsorsView from "../components/SponsorsView";
import MemberAuthView from "../components/MemberAuthView";

// The CMS bundle is large and only ever loaded by an authenticated admin, so it is
// split out of the main chunk entirely.
const AdminView = lazy(() => import("../components/AdminView"));

/** Chrome-level props the shell already resolved; shared by every route. */
export interface ChromeProps {
  siteLabels?: SiteLabels;
  siteSettings?: SiteSettings;
  isAdmin: boolean;
  onEditSection: (id: string) => void;
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 py-10" aria-busy="true" aria-label="Loading content">
      <div className="h-10 w-2/3 bg-brand-stone" />
      <div className="h-64 w-full bg-brand-stone" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map(index => (
          <div key={index} className="h-48 bg-brand-stone" />
        ))}
      </div>
    </div>
  );
}

function PageError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border border-red-500/20 bg-red-500/5 p-8 max-w-md mx-auto my-16 space-y-4 text-center">
      <AlertCircle size={32} className="mx-auto text-red-600" />
      <h2 className="font-display text-sm font-bold uppercase tracking-tight text-brand-ink">
        SECTION UNAVAILABLE
      </h2>
      <p className="font-sans text-xs leading-relaxed text-brand-ink/70">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-brand-ink text-brand-neutral px-5 py-2 text-xs font-display uppercase font-bold hover:bg-brand-pink transition-all cursor-pointer"
      >
        RETRY
      </button>
    </div>
  );
}

/**
 * Renders the skeleton on a cold load, an error card on failure, and the page itself
 * as soon as data exists — including cached data that is being revalidated.
 */
function ContentBoundary<T>({
  state,
  children
}: {
  state: PageContentState<T>;
  children: (data: T) => ReactNode;
}) {
  if (state.data) return <>{children(state.data)}</>;
  if (state.error) return <PageError message={state.error} onRetry={() => void state.refresh()} />;
  return <PageSkeleton />;
}

export function HomePage(chrome: ChromeProps) {
  const state = usePageContent<HomeContent>("home");
  return (
    <ContentBoundary state={state}>
      {data => (
        <HomeView
          news={data.news || []}
          scores={data.scores || []}
          instagramPosts={data.instagramPosts || []}
          simulatorSection={data.simulatorSection}
          welcomeSection={data.welcomeSection}
          homeSponsorSection={data.homeSponsorSection}
          sponsors={data.sponsors || []}
          {...chrome}
        />
      )}
    </ContentBoundary>
  );
}

const BLOG_PAGE_SIZE = 12;

export function BlogPage(chrome: ChromeProps) {
  const state = usePageContent<BlogContent>("blog", { limit: BLOG_PAGE_SIZE, offset: 0 });
  const [appended, setAppended] = useState<NewsItem[]>([]);
  const [nextOffset, setNextOffset] = useState(BLOG_PAGE_SIZE);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const total = state.data?.pagination?.total;

  // Reset the accumulated pages when the archive itself changes, but not on a routine
  // background revalidation — that would yank already-loaded posts out from under the reader.
  useEffect(() => {
    setAppended([]);
    setNextOffset(BLOG_PAGE_SIZE);
    setHasMore(state.data?.pagination?.hasMore ?? false);
  }, [total]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = await fetchPageContent<BlogContent>("blog", { limit: BLOG_PAGE_SIZE, offset: nextOffset });
      setAppended(current => [...current, ...(next.news || [])]);
      setNextOffset(offset => offset + BLOG_PAGE_SIZE);
      setHasMore(next.pagination?.hasMore ?? false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <ContentBoundary state={state}>
      {data => (
        <BlogView
          news={[...(data.news || []), ...appended]}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          {...chrome}
        />
      )}
    </ContentBoundary>
  );
}

export function ClubPage(chrome: ChromeProps) {
  const state = usePageContent<ClubContent>("club");
  return (
    <ContentBoundary state={state}>
      {data => <AboutClubView clubActivity={data.clubActivity} {...chrome} />}
    </ContentBoundary>
  );
}

/** An article page used to ship the whole archive; it now fetches one row by id. */
export function ActivityPage(chrome: ChromeProps) {
  const { id } = useParams<{ id: string }>();
  const state = usePageContent<ActivityContent>("activity", { id });

  // Only a genuine 404 sends the reader back to the index; a network blip shows the
  // retry card instead of silently losing the article they clicked.
  if (state.errorStatus === 404) return <Navigate to="/activities" replace />;

  return (
    <ContentBoundary state={state}>
      {data => <ActivityDetailView article={data.article} {...chrome} />}
    </ContentBoundary>
  );
}

// These four views render a single collection and never read site settings.
export function RosterPage({ siteLabels, isAdmin, onEditSection }: ChromeProps) {
  const state = usePageContent<RosterContent>("roster");
  return (
    <ContentBoundary state={state}>
      {data => (
        <RosterView
          roster={data.roster || []}
          siteLabels={siteLabels}
          isAdmin={isAdmin}
          onEditSection={onEditSection}
        />
      )}
    </ContentBoundary>
  );
}

export function StaffPage({ siteLabels, isAdmin, onEditSection }: ChromeProps) {
  const state = usePageContent<StaffContent>("staff");
  return (
    <ContentBoundary state={state}>
      {data => (
        <StaffView
          staff={data.staff || []}
          siteLabels={siteLabels}
          isAdmin={isAdmin}
          onEditSection={onEditSection}
        />
      )}
    </ContentBoundary>
  );
}

export function ScoresPage({ siteLabels, isAdmin, onEditSection }: ChromeProps) {
  const state = usePageContent<ScoresContent>("scores");
  return (
    <ContentBoundary state={state}>
      {data => (
        <ScoresView
          scores={data.scores || []}
          siteLabels={siteLabels}
          isAdmin={isAdmin}
          onEditSection={onEditSection}
        />
      )}
    </ContentBoundary>
  );
}

export function SponsorsPage({ siteLabels, isAdmin, onEditSection }: ChromeProps) {
  const state = usePageContent<SponsorsContent>("sponsors");
  return (
    <ContentBoundary state={state}>
      {data => (
        <SponsorsView
          sponsors={data.sponsors || []}
          siteLabels={siteLabels}
          isAdmin={isAdmin}
          onEditSection={onEditSection}
        />
      )}
    </ContentBoundary>
  );
}

interface MembershipPageProps {
  siteSettings?: SiteSettings;
  memberUser: any;
  setMemberUser: (user: any) => void;
  memberToken: string | null;
  setMemberToken: (token: string | null) => void;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
  adminSessionExpired: boolean;
  dismissAdminSessionExpired: () => void;
}

export function MembershipPage(props: MembershipPageProps) {
  const state = usePageContent<MembershipContent>("membership");

  // The member portal is usable before the event list arrives, so render immediately
  // and let the events fill in.
  const events = state.data?.memberEvents || [];
  const order = state.data?.memberEventsOrder || [];
  const orderedEvents: MemberEvent[] = order.length
    ? [
        ...order.map(id => events.find(event => event.id === id)).filter((e): e is MemberEvent => !!e),
        ...events.filter(event => !order.includes(event.id))
      ]
    : events;

  return <MemberAuthView {...props} memberEvents={orderedEvents} />;
}

interface AdminPageProps {
  adminToken: string;
  setAdminToken: (token: string | null) => void;
}

/**
 * The CMS is the one screen that legitimately needs everything, so it keeps using the
 * full /api/db payload — behind an admin gate, and never cached.
 */
export function AdminPage({ adminToken, setAdminToken }: AdminPageProps) {
  const [dbState, setDbState] = useState<DatabaseState | null>(null);
  const [error, setError] = useState("");

  const refreshState = async () => {
    try {
      const data = await getDatabaseState();
      setDbState(data);
      setError("");
    } catch {
      setError("Failed to synchronize with the database service.");
    } finally {
      // Public pages hold cached slices of the data the CMS just edited.
      invalidateContent();
    }
  };

  useEffect(() => {
    void refreshState();
  }, []);

  if (error && !dbState) return <PageError message={error} onRetry={() => void refreshState()} />;
  if (!dbState) return <PageSkeleton />;

  return (
    <AdminView
      dbState={dbState}
      refreshState={refreshState}
      adminToken={adminToken}
      setAdminToken={setAdminToken}
    />
  );
}

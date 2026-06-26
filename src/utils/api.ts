import { DatabaseState, NewsItem, Player, Staff, TournamentScore, GalleryImage, WelcomeSection, UpcomingActivity, Sponsor, SiteSettings, SiteLabels, HomeSponsorSection, ClubActivityContent } from "../types";

// Dynamic API helpers
export async function getDatabaseState(): Promise<DatabaseState> {
  const res = await fetch("/api/db");
  if (!res.ok) throw new Error("Failed to fetch database state");
  return res.json();
}

export async function loginAdmin(password: string): Promise<{ success: boolean; token?: string; message?: string }> {
  const res = await fetch("/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  return res.json();
}

// NEWS CRUD
export async function createNews(item: Partial<NewsItem>): Promise<{ success: boolean; item: NewsItem }> {
  const res = await fetch("/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create news article");
  return data;
}

export async function updateNews(id: string, item: Partial<NewsItem>): Promise<{ success: boolean; item: NewsItem }> {
  const res = await fetch(`/api/news/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update news article");
  return data;
}

export async function deleteNews(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete news article");
  return res.json();
}

// ROSTER CRUD
export async function createPlayer(item: Partial<Player>): Promise<{ success: boolean; item: Player }> {
  const res = await fetch("/api/roster", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to create player record");
  return res.json();
}

export async function updatePlayer(id: string, item: Partial<Player>): Promise<{ success: boolean; item: Player }> {
  const res = await fetch(`/api/roster/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update player record");
  return res.json();
}

export async function deletePlayer(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/roster/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete player record");
  return res.json();
}

// STAFF CRUD
export async function createStaff(item: Partial<Staff>): Promise<{ success: boolean; item: Staff }> {
  const res = await fetch("/api/staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to create staff record");
  return res.json();
}

export async function updateStaff(id: string, item: Partial<Staff>): Promise<{ success: boolean; item: Staff }> {
  const res = await fetch(`/api/staff/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update staff record");
  return res.json();
}

export async function deleteStaff(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete staff record");
  return res.json();
}

// SCORES CRUD
export async function createTournamentScore(item: Partial<TournamentScore>): Promise<{ success: boolean; item: TournamentScore }> {
  const res = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to create tournament result");
  return res.json();
}

export async function updateTournamentScore(id: string, item: Partial<TournamentScore>): Promise<{ success: boolean; item: TournamentScore }> {
  const res = await fetch(`/api/scores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update tournament result");
  return res.json();
}

export async function deleteTournamentScore(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/scores/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete tournament result");
  return res.json();
}

// GALLERY CRUD
export async function createGalleryImage(item: Partial<GalleryImage>): Promise<{ success: boolean; item: GalleryImage }> {
  const res = await fetch("/api/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to add gallery image");
  return res.json();
}

export async function deleteGalleryImage(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete gallery image");
  return res.json();
}

// WELCOME SECTION UPDATE
export async function updateWelcomeSection(item: WelcomeSection): Promise<{ success: boolean; welcomeSection: WelcomeSection }> {
  const res = await fetch("/api/welcome", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update welcome section");
  return res.json();
}

// UPCOMING ACTIVITY UPDATE
export async function updateUpcomingActivity(item: UpcomingActivity): Promise<{ success: boolean; upcomingActivity: UpcomingActivity }> {
  const res = await fetch("/api/upcoming-activity", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update upcoming activity");
  return res.json();
}

// SPONSORS CRUD
export async function createSponsor(item: Partial<Sponsor>): Promise<{ success: boolean; item: Sponsor }> {
  const res = await fetch("/api/sponsors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to create sponsor");
  return res.json();
}

export async function updateSponsor(id: string, item: Partial<Sponsor>): Promise<{ success: boolean; item: Sponsor }> {
  const res = await fetch(`/api/sponsors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update sponsor");
  return res.json();
}

export async function deleteSponsor(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/sponsors/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete sponsor");
  return res.json();
}

// SITE SETTINGS UPDATE
export async function updateSiteSettings(item: SiteSettings): Promise<{ success: boolean; siteSettings: SiteSettings }> {
  const res = await fetch("/api/site-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update site settings");
  return res.json();
}

export async function updateSiteLabels(item: Partial<SiteLabels>): Promise<{ success: boolean; siteLabels: SiteLabels }> {
  const res = await fetch("/api/site-labels", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update site labels");
  return res.json();
}

export async function updateSiteLabelsThai(item: Partial<SiteLabels>): Promise<{ success: boolean; siteLabelsThai: SiteLabels }> {
  const res = await fetch("/api/site-labels-thai", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update Thai site labels");
  return res.json();
}

export async function updateHomeSponsorSection(item: HomeSponsorSection): Promise<{ success: boolean }> {
  const res = await fetch("/api/home-sponsor-section", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update home sponsor section");
  return res.json();
}

export async function updateClubActivity(item: ClubActivityContent): Promise<{ success: boolean }> {
  const res = await fetch("/api/club-activity", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  if (!res.ok) throw new Error("Failed to update club activity content");
  return res.json();
}

// PHOTO FILES ASYNC UPLOADER OR SYSTEM PERSISTENCE
export async function uploadPhoto(filename: string, base64Data: string): Promise<{ success: boolean; url: string; message?: string }> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, base64Data })
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to upload local raw graphic material");
  }
  return data;
}

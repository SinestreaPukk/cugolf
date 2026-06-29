import { DatabaseState, NewsItem, Player, Staff, TournamentScore, GalleryImage, WelcomeSection, UpcomingActivity, Sponsor, SiteSettings, SiteLabels, HomeSponsorSection, ClubActivityContent, Member } from "../types";

async function handleResponse(res: Response, defaultError: string) {
  const text = await res.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`${defaultError} (Invalid response from server)`);
    }
  }
  if (!res.ok) {
    throw new Error(data.message || defaultError);
  }
  return data;
}

// Dynamic API helpers
export async function getDatabaseState(): Promise<DatabaseState> {
  const res = await fetch("/api/db");
  return handleResponse(res, "Failed to fetch database state");
}

export async function loginAdmin(password: string): Promise<{ success: boolean; token?: string; message?: string }> {
  const res = await fetch("/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  return handleResponse(res, "Failed to login admin");
}

// NEWS CRUD
export async function createNews(item: Partial<NewsItem>): Promise<{ success: boolean; item: NewsItem }> {
  const res = await fetch("/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to create news article");
}

export async function updateNews(id: string, item: Partial<NewsItem>): Promise<{ success: boolean; item: NewsItem }> {
  const res = await fetch(`/api/news/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to update news article");
}

export async function deleteNews(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
  return handleResponse(res, "Failed to delete news article");
}

// ROSTER PLAYERS CRUD
export async function createPlayer(item: Partial<Player>): Promise<{ success: boolean; item: Player }> {
  const res = await fetch("/api/roster", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to create player record");
}

export async function updatePlayer(id: string, item: Partial<Player>): Promise<{ success: boolean; item: Player }> {
  const res = await fetch(`/api/roster/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to update player record");
}

export async function deletePlayer(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/roster/${id}`, { method: "DELETE" });
  return handleResponse(res, "Failed to delete player record");
}

// STAFF CRUD
export async function createStaff(item: Partial<Staff>): Promise<{ success: boolean; item: Staff }> {
  const res = await fetch("/api/staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to create staff record");
}

export async function updateStaff(id: string, item: Partial<Staff>): Promise<{ success: boolean; item: Staff }> {
  const res = await fetch(`/api/staff/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to update staff record");
}

export async function deleteStaff(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
  return handleResponse(res, "Failed to delete staff record");
}

// SCORES CRUD
export async function createTournamentScore(item: Partial<TournamentScore>): Promise<{ success: boolean; item: TournamentScore }> {
  const res = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to create tournament result");
}

export async function updateTournamentScore(id: string, item: Partial<TournamentScore>): Promise<{ success: boolean; item: TournamentScore }> {
  const res = await fetch(`/api/scores/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to update tournament result");
}

export async function deleteTournamentScore(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/scores/${id}`, { method: "DELETE" });
  return handleResponse(res, "Failed to delete tournament result");
}

// GALLERY CRUD
export async function createGalleryImage(item: Partial<GalleryImage>): Promise<{ success: boolean; item: GalleryImage }> {
  const res = await fetch("/api/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to add gallery image");
}

export async function deleteGalleryImage(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
  return handleResponse(res, "Failed to delete gallery image");
}

// WELCOME SECTION UPDATE
export async function updateWelcomeSection(item: WelcomeSection): Promise<{ success: boolean; welcomeSection: WelcomeSection }> {
  const res = await fetch("/api/welcome", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to update welcome section");
}

// UPCOMING ACTIVITY UPDATE
export async function updateUpcomingActivity(item: UpcomingActivity): Promise<{ success: boolean; upcomingActivity: UpcomingActivity }> {
  const res = await fetch("/api/upcoming-activity", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to update upcoming activity");
}

// SPONSORS CRUD
export async function createSponsor(item: Partial<Sponsor>): Promise<{ success: boolean; item: Sponsor }> {
  const res = await fetch("/api/sponsors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to create sponsor");
}

export async function updateSponsor(id: string, item: Partial<Sponsor>): Promise<{ success: boolean; item: Sponsor }> {
  const res = await fetch(`/api/sponsors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to update sponsor");
}

export async function deleteSponsor(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/sponsors/${id}`, { method: "DELETE" });
  return handleResponse(res, "Failed to delete sponsor");
}

// SITE SETTINGS UPDATE
export async function updateSiteSettings(item: SiteSettings): Promise<{ success: boolean; siteSettings: SiteSettings }> {
  const res = await fetch("/api/site-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to update site settings");
}

export async function updateSiteLabels(item: Partial<SiteLabels>): Promise<{ success: boolean; siteLabels: SiteLabels }> {
  const res = await fetch("/api/site-labels", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to update site labels");
}

export async function updateSiteLabelsThai(item: Partial<SiteLabels>): Promise<{ success: boolean; siteLabelsThai: SiteLabels }> {
  const res = await fetch("/api/site-labels-thai", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to update Thai site labels");
}

export async function updateHomeSponsorSection(item: HomeSponsorSection): Promise<{ success: boolean }> {
  const res = await fetch("/api/home-sponsor-section", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to update home sponsor section");
}

export async function updateClubActivity(item: ClubActivityContent): Promise<{ success: boolean }> {
  const res = await fetch("/api/club-activity", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item)
  });
  return handleResponse(res, "Failed to update club activity content");
}

// PHOTO FILES ASYNC UPLOADER
export async function uploadPhoto(filename: string, base64Data: string): Promise<{ success: boolean; url: string; message?: string }> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, base64Data })
  });
  return handleResponse(res, "Failed to upload graphic material");
}

// MEMBERSHIP API HELPERS
export async function registerMember(memberData: Partial<Member> & { password?: string }): Promise<{ success: boolean; message?: string }> {
  const res = await fetch("/api/members/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(memberData)
  });
  return handleResponse(res, "Failed to register member");
}

export async function loginMember(credentials: { email?: string; password?: string }): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
  const res = await fetch("/api/members/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
  });
  return handleResponse(res, "Failed to login member");
}

export async function getMemberProfile(token: string): Promise<{ success: boolean; user?: any; message?: string }> {
  const res = await fetch("/api/members/me", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return handleResponse(res, "Failed to retrieve member profile");
}

export async function getAdminMembers(token: string): Promise<{ success: boolean; members?: Member[]; message?: string }> {
  const res = await fetch("/api/admin/members", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return handleResponse(res, "Failed to retrieve members directory");
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch("/api/members/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  return handleResponse(res, "Failed to request password reset");
}

export async function resetPassword(password: string, token: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch("/api/members/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ password })
  });
  return handleResponse(res, "Failed to reset password");
}

export async function getAdminEmailsList(token: string): Promise<{ success: boolean; emails?: string[]; message?: string }> {
  const res = await fetch("/api/admin/emails", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return handleResponse(res, "Failed to fetch admin list");
}

export async function addAdminEmail(email: string, token: string): Promise<{ success: boolean; emails?: string[]; message?: string }> {
  const res = await fetch("/api/admin/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ email })
  });
  return handleResponse(res, "Failed to add admin email");
}

export async function removeAdminEmail(email: string, token: string): Promise<{ success: boolean; emails?: string[]; message?: string }> {
  const res = await fetch("/api/admin/emails", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ email })
  });
  return handleResponse(res, "Failed to remove admin email");
}

export async function syncMembersToSheets(token: string): Promise<{ success: boolean; synced?: number; total?: number; errors?: number; message?: string }> {
  const res = await fetch("/api/admin/sync-sheets", {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  });
  return handleResponse(res, "Failed to sync members to Google Sheets");
}

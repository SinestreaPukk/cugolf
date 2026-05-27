import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase - with validation and production fallback
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("FATAL ERROR: Supabase credentials missing in environment variables.");
  console.error("On Render, ensure you have set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or their VITE_ equivalents) in the Environment panel.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini client conditionally if API key exists
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static uploaded materials (Keep for backward compatibility during migration)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Photo upload endpoint - Updated to use Supabase Storage
app.post("/api/upload", async (req, res) => {
  const { filename, base64Data } = req.body;
  if (!filename || !base64Data) {
    return res.status(400).json({ success: false, message: "Missing filename or base64Data payload." });
  }

  try {
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, "base64");

    const ext = path.extname(filename) || ".png";
    const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFilename = `${baseName}-${Date.now()}${ext}`;

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(uniqueFilename, buffer, {
        contentType: `image/${ext.replace(".", "")}`,
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("uploads")
      .getPublicUrl(uniqueFilename);

    res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error("Supabase Storage upload error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to upload to Supabase." });
  }
});


// REST endpoints for the Database Layer
app.get("/api/db", async (req, res) => {
  try {
    const collections = ["news", "roster", "staff", "scores", "gallery", "sponsors"];
    const results = await Promise.all(collections.map(c => supabase.from(c).select("*")));
    
    const db: any = {};
    collections.forEach((name, index) => {
      db[name] = results[index].data || [];
    });

    // Fetch site configs
    const { data: configs } = await supabase.from("site_config").select("*");
    if (configs) {
      configs.forEach(config => {
        const camelKey = config.key.replace(/_([a-z])/g, (_: any, letter: string) => letter.toUpperCase());
        db[camelKey] = config.data;
      });
    }

    res.json(db);
  } catch (err) {
    console.error("Error fetching from Supabase:", err);
    res.status(500).json({ error: "Failed to fetch database" });
  }
});

// Admin validation - Updated to use Supabase Auth
app.post("/api/admin/auth", async (req, res) => {
  const { password } = req.body;
  const adminEmail = "admin@cugolfclub.com"; // Default admin email for the club

  try {
    // Attempt to sign in with the provided password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: password,
    });

    if (error) {
      // If user doesn't exist, try to create them (first-time setup)
      if (error.message.includes("Invalid login credentials") && password === "cugolfx2026") {
         const { error: signUpError } = await supabase.auth.admin.createUser({
           email: adminEmail,
           password: password,
           email_confirm: true
         });
         
         if (!signUpError) {
           // Retry login after creation
           const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
             email: adminEmail,
             password: password,
           });
           if (!retryError) {
             return res.json({ success: true, token: retryData.session?.access_token });
           }
         }
      }
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    res.json({ success: true, token: data.session?.access_token });
  } catch (err: any) {
    console.error("Auth error:", err);
    res.status(500).json({ success: false, message: "Authentication service error." });
  }
});

// BLOGS CRUD
app.post("/api/news", async (req, res) => {
  const newItem = {
    id: `news-${Date.now()}`,
    title: req.body.title || "Untitled Article",
    excerpt: req.body.excerpt || "",
    content: req.body.content || "",
    publishDate: req.body.publishDate || new Date().toISOString().split("T")[0],
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1200"
  };
  const { error } = await supabase.from("news").insert(newItem);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, item: newItem });
});

app.put("/api/news/:id", async (req, res) => {
  const { error } = await supabase.from("news").update(req.body).eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

app.delete("/api/news/:id", async (req, res) => {
  const { error } = await supabase.from("news").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// ROSTER PLAYERS CRUD
app.post("/api/roster", async (req, res) => {
  const newItem = {
    id: `player-${Date.now()}`,
    name: req.body.name || "Anonymous Player",
    handicap: typeof req.body.handicap === "number" ? req.body.handicap : 2.0,
    year: req.body.year || "Freshman",
    faculty: req.body.faculty || "Faculty of Sports Science",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    isFeatured: !!req.body.isFeatured
  };
  const { error } = await supabase.from("roster").insert(newItem);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, item: newItem });
});

app.put("/api/roster/:id", async (req, res) => {
  const { error } = await supabase.from("roster").update(req.body).eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

app.delete("/api/roster/:id", async (req, res) => {
  const { error } = await supabase.from("roster").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// STAFF CRUD
app.post("/api/staff", async (req, res) => {
  const newItem = {
    id: `staff-${Date.now()}`,
    name: req.body.name || "Staff Member",
    role: req.body.role || "Committee Member",
    year: req.body.year || "Club Operations",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    order: typeof req.body.order === "number" ? req.body.order : 0
  };
  const { error } = await supabase.from("staff").insert(newItem);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, item: newItem });
});

app.put("/api/staff/:id", async (req, res) => {
  const { error } = await supabase.from("staff").update(req.body).eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

app.delete("/api/staff/:id", async (req, res) => {
  const { error } = await supabase.from("staff").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// TOURNAMENTS & SCORES CRUD
app.post("/api/scores", async (req, res) => {
  const newItem = {
    id: `score-${Date.now()}`,
    tournamentName: req.body.tournamentName || "Chula Internal Open",
    date: req.body.date || new Date().toISOString().split("T")[0],
    result: req.body.result || "Practice Round",
    playersCount: Array.isArray(req.body.scoresList) ? req.body.scoresList.length : 0,
    scoresList: req.body.scoresList || []
  };
  const { error } = await supabase.from("scores").insert(newItem);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, item: newItem });
});

app.put("/api/scores/:id", async (req, res) => {
  const { error } = await supabase.from("scores").update(req.body).eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

app.delete("/api/scores/:id", async (req, res) => {
  const { error } = await supabase.from("scores").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// GALLERY CRUD
app.post("/api/gallery", async (req, res) => {
  const newItem = {
    id: `photo-${Date.now()}`,
    title: req.body.title || "Club Photography",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800",
    date: req.body.date || new Date().toISOString().split("T")[0],
    category: req.body.category || "General"
  };
  const { error } = await supabase.from("gallery").insert(newItem);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, item: newItem });
});

app.delete("/api/gallery/:id", async (req, res) => {
  const { error } = await supabase.from("gallery").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// WELCOME SECTION UPDATE
app.put("/api/welcome", async (req, res) => {
  const { error } = await supabase.from("site_config").upsert({
    key: "welcome_section",
    data: req.body
  });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// UPCOMING ACTIVITY UPDATE
app.put("/api/upcoming-activity", async (req, res) => {
  const { error } = await supabase.from("site_config").upsert({
    key: "upcoming_activity",
    data: req.body
  });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// SPONSORS CRUD
app.post("/api/sponsors", async (req, res) => {
  const newItem = {
    id: `sponsor-${Date.now()}`,
    name: req.body.name || "Brand Partner",
    description: req.body.description || "",
    websiteUrl: req.body.websiteUrl || "",
    imageUrl: req.body.imageUrl || "",
    isActive: req.body.isActive ?? true
  };
  const { error } = await supabase.from("sponsors").insert(newItem);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true, item: newItem });
});

app.put("/api/sponsors/:id", async (req, res) => {
  const { error } = await supabase.from("sponsors").update(req.body).eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

app.delete("/api/sponsors/:id", async (req, res) => {
  const { error } = await supabase.from("sponsors").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// SITE SETTINGS UPDATE
app.put("/api/site-settings", async (req, res) => {
  const { error } = await supabase.from("site_config").upsert({
    key: "site_settings",
    data: req.body
  });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// SITE LABELS UPDATE
app.put("/api/site-labels", async (req, res) => {
  const { error } = await supabase.from("site_config").upsert({
    key: "site_labels",
    data: req.body
  });
  if (error) return res.status(500).json({ success: false, message: error.message });
  res.json({ success: true });
});

// Start routing with Vite / Static bundling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite middleware in development so HMR/Vite serving is active isomorphically
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Read files directly in production container
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();

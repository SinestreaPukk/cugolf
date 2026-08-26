// ESM evaluates imported modules before the importing module's body, so server.ts's
// own dotenv.config() call runs *after* these modules have already initialized. Any
// server module that reads process.env at load time must import this first.
import dotenv from "dotenv";

dotenv.config();

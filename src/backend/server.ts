import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { analyzeLabResult, getHealthAssistantResponse } from "./aiService.js";

// Load environment variables
dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "AiCare API is running" });
});

// AI Analysis Route
app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { input, provider } = req.body;
    const result = await analyzeLabResult(input, provider);
    res.json(result);
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Chat Route
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { history, message, base64Image, provider } = req.body;
    const result = await getHealthAssistantResponse(history, message, base64Image, provider);
    res.json({ result });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

export default app;

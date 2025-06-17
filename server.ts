// server.ts
import * as dotenv from 'dotenv';
dotenv.config();

import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { AppDataSource } from "./src/config/database";
import { createApp } from "./src/app";
import { DataSource } from "typeorm";
import Container from "typedi";

const app = createApp();
const server = createServer(app);

// WebSocket for audio
const wss = new WebSocketServer({
  server,
  path: "/audio"
});

const audioChunks = new Map<WebSocket, Buffer[]>();

wss.on("connection", (ws: WebSocket) => {
  console.log("🎙️ Client connected to /audio");
  audioChunks.set(ws, []);
  let processingTimer: NodeJS.Timeout | null = null;

  ws.on("message", (message: Buffer) => {
    const chunks = audioChunks.get(ws) || [];
    chunks.push(message);
    audioChunks.set(ws, chunks);

    if (processingTimer) clearTimeout(processingTimer);

    processingTimer = setTimeout(() => {
      processAudioChunks(ws);
    }, 2000);
  });

  ws.on("close", () => {
    console.log("🔌 WebSocket connection closed");
    audioChunks.delete(ws);
    if (processingTimer) clearTimeout(processingTimer);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

async function processAudioChunks(ws: WebSocket) {
  const chunks = audioChunks.get(ws);
  if (!chunks || chunks.length === 0) return;

  try {
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    console.log("Total audio size:", totalSize);

    let transcription = "";
    if (totalSize > 50000) transcription = "What is Node.js?";
    else if (totalSize > 30000) transcription = "Explain React hooks";
    else if (totalSize > 20000) transcription = "What is JavaScript?";
    else transcription = "Tell me about programming";

    ws.send(JSON.stringify({ type: "transcript", text: transcription }));
    audioChunks.set(ws, []);
  } catch (error) {
    console.error("Error processing audio:", error);
    ws.send(JSON.stringify({ type: "error", message: "Failed to process audio" }));
  }
}

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected successfully");

    Container.set(DataSource, AppDataSource);

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📱 Health check at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
};

startServer();

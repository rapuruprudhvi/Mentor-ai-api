import axios from "axios";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

export async function getAnswerFromOpenAI(question: string): Promise<string> {
  const provider = process.env.AI_PROVIDER || "claude";
  
console.log("provider:",provider)
  if (provider === "ollama") {
    try {
      const response = await axios.post(
        "http://localhost:11434/v1/chat/completions",
        {
          model: "tinyllama",
          messages: [{ role: "user", content: question }],
          stream: true,
        },
        {
          responseType: "stream",
        }
      );

      const stream = response.data as Readable;
      let finalText = "";

      return await new Promise((resolve, reject) => {
        stream.on("data", (chunk: Buffer) => {
          const lines = chunk
            .toString()
            .split("\n")
            .filter((line) => line.trim() !== "");

          for (const line of lines) {
            try {
              const json = JSON.parse(line.replace(/^data:\s*/, ""));
              const content = json.message?.content || json.choices?.[0]?.delta?.content;
              if (content) {
                finalText += content;
              }
            } catch (err) {
              console.warn("Stream JSON parse error:", err);
            }
          }
        });

        stream.on("end", () => {
          resolve(finalText || "No response from Ollama.");
        });

        stream.on("error", (err: any) => {
          console.error("Ollama stream error:", err);
          reject("Failed to read from Ollama stream.");
        });
      });
    } catch (error: any) {
      console.error("Ollama request failed:", error?.message);
      return "Failed to get response from Ollama.";
    }
  }


  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: question,
          },
        ],
      },
      {
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY as string,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.content?.[0]?.text || "No response from Claude.";
    return content;
  } catch (error: any) {
    console.error("Claude API Error:", error?.response?.data || error.message);
    return "Failed to get answer from Claude.";
  }
}
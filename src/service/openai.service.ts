import axios from "axios";
import { OPENAI_API_URL } from "../config/api.config";

export async function getAnswerFromOpenAI(question: string): Promise<string> {
  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: "tinyllama",
      messages: [{ role: "user", content: question }],
      stream: true
    },
    { responseType: "stream" }
  );

  let finalText = "";

  return new Promise((resolve, reject) => {
    response.data.on("data", (chunk: Buffer) => {
      const lines = chunk.toString().split("\n").filter(line => line.trim() !== "");
      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          const content = json.message?.content;
          if (content) {
            finalText += content;
          }
        } catch (_) {}
      }
    });

    response.data.on("end", () => {
      resolve(finalText);
    });

    response.data.on("error", (err: any) => {
      reject(err);
    });
  });
}

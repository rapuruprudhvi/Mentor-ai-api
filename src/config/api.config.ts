type EnvType = "development" | "production";

const ENV: EnvType = (process.env.NODE_ENV as EnvType) || "development";

const config: Record<EnvType, { openAIBaseURL: string }> = {
  development: {
    openAIBaseURL: "http://localhost:11434/api/chat",
  },
  production: {
    openAIBaseURL: "https://chat-server.com/api/chat",
  },
};

export const OPENAI_API_URL = config[ENV].openAIBaseURL;

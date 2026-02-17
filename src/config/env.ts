export interface TranslationConfig {
  provider: "mock" | "google";
  googleApiKey?: string;
}

export const translationConfig: TranslationConfig = {
  provider: (process.env.TRANSLATE_PROVIDER as "mock" | "google") ?? 'mock',
  googleApiKey: process.env.GOOGLE_TRANSLATE_API_KEY,
};
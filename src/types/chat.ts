export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  imagePreviewUrl?: string;
  /** excluded from the rendered transcript, but still sent to the API for context */
  hidden?: boolean;
  /** data: URL of an AI-generated illustration for this (assistant) message */
  generatedImageUrl?: string;
}

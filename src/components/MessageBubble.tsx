"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, Check, Copy, Sparkles, User } from "lucide-react";
import MermaidDiagram from "@/components/MermaidDiagram";
import BookmarkButton from "@/components/BookmarkButton";
import type { BookmarkModule } from "@/lib/repo";
import type { ChatMessage } from "@/types/chat";

interface CodeChildProps {
  className?: string;
  children?: React.ReactNode;
}

export default function MessageBubble({
  message,
  onGenerateImage,
  imageGenerating,
  bookmark,
}: {
  message: ChatMessage;
  onGenerateImage?: (message: ChatMessage) => void;
  imageGenerating?: boolean;
  bookmark?: { module: BookmarkModule; question: string };
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access denied — silently ignore, it's a non-critical convenience
    }
  }

  return (
    <div className={`group flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
          isUser ? "bg-primary text-white" : "bg-gradient-to-br from-ai-indigo to-ai-teal text-white"
        }`}
        aria-hidden
      >
        {isUser ? <User className="h-3.5 w-3.5" aria-hidden /> : <Bot className="h-3.5 w-3.5" aria-hidden />}
      </div>

      <div className={`flex max-w-[85%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser
              ? "bg-primary text-white"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          }`}
        >
          {message.imagePreviewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={message.imagePreviewUrl}
              alt="Uploaded attachment"
              className="mb-2 max-h-48 rounded-lg border border-black/10"
            />
          )}
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-neutral-900 prose-pre:text-neutral-100">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre(props) {
                    const child = props.children as
                      | React.ReactElement<CodeChildProps>
                      | undefined;
                    const className = child?.props?.className ?? "";
                    if (/language-mermaid/.test(className)) {
                      const code = String(child?.props?.children ?? "").replace(/\n$/, "");
                      return <MermaidDiagram code={code} />;
                    }
                    return <pre {...props} />;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {message.generatedImageUrl && (
            <div className="mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.generatedImageUrl}
                alt="AI-generated illustration"
                className="max-h-72 rounded-lg border border-black/10"
              />
              <a
                href={message.generatedImageUrl}
                download="testmentor-illustration.png"
                className="mt-1 inline-block text-xs text-primary hover:underline dark:text-indigo-400"
              >
                Download image
              </a>
            </div>
          )}
        </div>

        {!isUser && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-neutral-400 opacity-0 transition-opacity hover:text-neutral-600 dark:hover:text-neutral-300 group-hover:opacity-100"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" aria-hidden /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" aria-hidden /> Copy
                </>
              )}
            </button>
            {onGenerateImage && !message.generatedImageUrl && (
              <button
                type="button"
                onClick={() => onGenerateImage(message)}
                disabled={imageGenerating}
                className="flex items-center gap-1 text-xs text-neutral-400 opacity-0 transition-opacity hover:text-neutral-600 dark:hover:text-neutral-300 group-hover:opacity-100 disabled:opacity-100"
              >
                <Sparkles className="h-3 w-3" aria-hidden />
                {imageGenerating ? "Generating image…" : "Generate image"}
              </button>
            )}
            {bookmark && (
              <BookmarkButton
                module={bookmark.module}
                question={bookmark.question}
                answer={message.content}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MermaidDiagram from "@/components/MermaidDiagram";
import type { ChatMessage } from "@/types/chat";

interface CodeChildProps {
  className?: string;
  children?: React.ReactNode;
}

export default function MessageBubble({
  message,
  onGenerateImage,
  imageGenerating,
}: {
  message: ChatMessage;
  onGenerateImage?: (message: ChatMessage) => void;
  imageGenerating?: boolean;
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
          isUser
            ? "bg-blue-600 text-white"
            : "bg-neutral-200 dark:bg-neutral-700"
        }`}
        aria-hidden
      >
        {isUser ? "🧑" : "🤖"}
      </div>

      <div className={`flex max-w-[85%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser
              ? "bg-blue-600 text-white"
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
                className="mt-1 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
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
              className="text-xs text-neutral-400 opacity-0 transition-opacity hover:text-neutral-600 dark:hover:text-neutral-300 group-hover:opacity-100"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
            {onGenerateImage && !message.generatedImageUrl && (
              <button
                type="button"
                onClick={() => onGenerateImage(message)}
                disabled={imageGenerating}
                className="text-xs text-neutral-400 opacity-0 transition-opacity hover:text-neutral-600 dark:hover:text-neutral-300 group-hover:opacity-100 disabled:opacity-100"
              >
                {imageGenerating ? "Generating image…" : "🎨 Generate image"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

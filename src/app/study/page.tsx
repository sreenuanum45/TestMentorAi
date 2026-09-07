"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Paintbrush, Paperclip } from "lucide-react";
import MessageBubble from "@/components/MessageBubble";
import PageHero from "@/components/PageHero";
import TypingIndicator from "@/components/TypingIndicator";
import { readImageFile, type ReadImageResult } from "@/lib/image";
import type { ChatMessage } from "@/types/chat";

type PendingImage = ReadImageResult;

const SUGGESTED_QUESTIONS = [
  "Explicit vs implicit waits in Selenium?",
  "How do you design a data-driven test framework?",
  "REST vs SOAP — what would you test differently?",
  "How do you handle flaky tests in CI?",
];

export default function StudyCompanionPage() {
  return (
    <Suspense>
      <StudyCompanion />
    </Suspense>
  );
}

function StudyCompanion() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [lastFailedSend, setLastFailedSend] = useState<{
    nextMessages: ChatMessage[];
    imageToSend: PendingImage | null;
  } | null>(null);
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoSentRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !autoSentRef.current) {
      autoSentRef.current = true;
      setInput(q);
      sendMessage(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImage(await readImageFile(file));
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setPendingImage(await readImageFile(file));
    }
  }

  async function submitTurn(nextMessages: ChatMessage[], imageToSend: PendingImage | null) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          image: imageToSend
            ? { mimeType: imageToSend.mimeType, data: imageToSend.data }
            : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.reply },
      ]);
      setLastFailedSend(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLastFailedSend({ nextMessages, imageToSend });
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() && !pendingImage) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim() || "Analyze this screenshot.",
      imagePreviewUrl: pendingImage?.previewUrl,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    const imageToSend = pendingImage;
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    await submitTurn(nextMessages, imageToSend);
  }

  async function handleGenerateImage(message: ChatMessage) {
    setGeneratingImageId(message.id);
    setImageError(null);
    try {
      const prompt = `Create a clean, minimal, flat-design technical illustration (no unnecessary text) visualizing this QA engineering concept for a study aid:\n\n${message.content.slice(0, 600)}`;
      const res = await fetch("/api/study/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed");
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, generatedImageUrl: data.image } : m))
      );
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGeneratingImageId(null);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-3xl flex-col gap-4 p-4">
      <PageHero
        icon={BookOpen}
        eyebrow="Ask Anything"
        title="Study Companion"
        description="Ask any QA interview question, or attach a bug screenshot / DOM snippet for locator and defect analysis."
        tagline="Learn Deeper. Interview Smarter."
        color="blue"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`flex-1 space-y-3 overflow-y-auto rounded-xl border p-4 transition-colors ${
          dragActive
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
            : "border-neutral-200 dark:border-neutral-800"
        }`}
      >
        {messages.length === 0 && (
          <div>
            <p className="mb-2 text-sm text-neutral-400">Try one of these, or drag in a screenshot:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble
            key={m.id}
            message={m}
            onGenerateImage={handleGenerateImage}
            imageGenerating={generatingImageId === m.id}
            bookmark={
              m.role === "assistant"
                ? { module: "STUDY", question: messages[i - 1]?.content ?? "Study Companion answer" }
                : undefined
            }
          />
        ))}
        {loading && <TypingIndicator label="TestMentor AI is thinking…" />}
        {error && (
          <div className="flex items-center gap-3 text-sm text-red-500">
            <span>{error}</span>
            {lastFailedSend && (
              <button
                type="button"
                onClick={() => submitTurn(lastFailedSend.nextMessages, lastFailedSend.imageToSend)}
                className="rounded-full border border-red-300 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/40"
              >
                Retry
              </button>
            )}
          </div>
        )}
        {imageError && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <Paintbrush className="h-4 w-4 shrink-0" aria-hidden />
            <span>{imageError}</span>
            <button
              type="button"
              onClick={() => setImageError(null)}
              className="ml-auto text-amber-600 hover:underline dark:text-amber-300"
            >
              Dismiss
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {pendingImage && (
        <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pendingImage.previewUrl} alt="Pending attachment" className="h-10 w-10 rounded object-cover" />
          <span>Image attached — will be sent with your next message</span>
          <button
            type="button"
            onClick={() => {
              setPendingImage(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="text-red-500 hover:underline"
          >
            Remove
          </button>
        </div>
      )}

      <div className="mt-3 flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          title="Attach a screenshot"
          className="flex cursor-pointer items-center rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
        >
          <Paperclip className="h-4 w-4" aria-hidden />
        </label>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Ask a QA interview question…"
          rows={1}
          className="flex-1 resize-none rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "@/components/MessageBubble";
import TypingIndicator from "@/components/TypingIndicator";
import type { ChatMessage } from "@/types/chat";

type Difficulty = "Friendly" | "Standard" | "Tough";

interface SetupForm {
  role: string;
  experience: string;
  focus: string;
  numQuestions: number;
  difficulty: Difficulty;
}

const ROLE_PRESETS = ["Manual QA", "SDET", "Automation Engineer", "QA Lead"];
const EXPERIENCE_PRESETS = ["0-2 Years", "3-5 Years", "6+ Years"];
const FOCUS_PRESETS = ["Manual Testing", "Automation Frameworks", "API Testing", "Performance Testing"];
const NUM_QUESTIONS_PRESETS = [3, 5, 7, 10];
const DIFFICULTY_PRESETS: Difficulty[] = ["Friendly", "Standard", "Tough"];

function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " code snippet omitted ")
    .replace(/[*_#>`]/g, "")
    .replace(/\|/g, " ")
    .replace(/\n{2,}/g, ". ");
}

export default function MockInterviewPage() {
  const [setup, setSetup] = useState<SetupForm | null>(null);
  const [form, setForm] = useState<SetupForm>({
    role: "Senior SDET",
    experience: "4 Years",
    focus: "Automation Frameworks & API Testing",
    numQuestions: 5,
    difficulty: "Standard",
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [speechRate, setSpeechRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [speechPaused, setSpeechPaused] = useState(false);
  const [lastFailedTurn, setLastFailedTurn] = useState<{
    nextMessages: ChatMessage[];
    activeSetup: SetupForm;
  } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastSpokenIdRef = useRef<string | null>(null);

  useEffect(() => {
    // One-time browser feature detection — must run post-mount so the server-rendered
    // markup (no `window`) matches the client's first render before this flips.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSpeechSupported(
      Boolean(window.SpeechRecognition || window.webkitSpeechRecognition) &&
        "speechSynthesis" in window
    );
  }, []);

  useEffect(() => {
    if (!speechSupported) return;
    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      setVoices(list);
      setVoiceURI((prev) => prev || list.find((v) => v.lang.startsWith("en"))?.voiceURI || list[0]?.voiceURI || "");
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [speechSupported]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  function speak(text: string) {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stripMarkdownForSpeech(text));
    const voice = voices.find((v) => v.voiceURI === voiceURI);
    if (voice) utterance.voice = voice;
    utterance.rate = speechRate;
    utterance.onstart = () => {
      setSpeaking(true);
      setSpeechPaused(false);
    };
    utterance.onend = () => {
      setSpeaking(false);
      setSpeechPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setSpeechPaused(false);
    };
    utterance.onpause = () => setSpeechPaused(true);
    utterance.onresume = () => setSpeechPaused(false);
    window.speechSynthesis.speak(utterance);
  }

  function handlePauseResume() {
    if (speechPaused) {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.pause();
    }
  }

  function handleStopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setSpeechPaused(false);
  }

  function handleReplay() {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant) speak(lastAssistant.content);
  }

  useEffect(() => {
    if (!voiceMode) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant && lastAssistant.id !== lastSpokenIdRef.current) {
      lastSpokenIdRef.current = lastAssistant.id;
      speak(lastAssistant.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, voiceMode]);

  // Stop any in-flight mic/speech when voice mode is turned off, and on unmount —
  // otherwise a stale recognition session can keep firing into a page that's moved on.
  useEffect(() => {
    if (!voiceMode) {
      recognitionRef.current?.abort();
      // Resetting internal state to match the external mic session just aborted.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setListening(false);
    }
  }, [voiceMode]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis.cancel();
    };
  }, []);

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    // Defensively tear down any stale session before starting a new one —
    // a leftover instance left running is what caused answers to double up.
    recognitionRef.current?.abort();

    const baseText = input.trim();
    const recognition = new Ctor();
    recognition.lang = "en-US";
    // continuous=false made Chrome auto-stop the mic on any brief pause —
    // which happens constantly mid-answer when someone's thinking. Keep the
    // session open across pauses; only the Stop button or onerror ends it.
    recognition.continuous = true;
    // Interim results stream partial text as the candidate talks, instead of
    // one big delayed dump at the end.
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0]?.transcript ?? "";
        else interimText += result[0]?.transcript ?? "";
      }
      // Concatenate, don't choose one — with continuous mode there can be
      // several finalized segments already, plus one in-progress interim one.
      const transcript = `${finalText}${interimText}`.trim();
      setInput(baseText ? `${baseText} ${transcript}` : transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  async function requestNextTurn(nextMessages: ChatMessage[], activeSetup: SetupForm) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          role: activeSetup.role,
          experience: activeSetup.experience,
          focus: activeSetup.focus,
          numQuestions: activeSetup.numQuestions,
          difficulty: activeSetup.difficulty,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.reply },
      ]);
      setLastFailedTurn(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLastFailedTurn({ nextMessages, activeSetup });
    } finally {
      setLoading(false);
    }
  }

  async function handleStart() {
    const kickoff: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: "I'm ready to begin the interview.",
      hidden: true,
    };
    setSetup(form);
    setMessages([kickoff]);
    await requestNextTurn([kickoff], form);
  }

  async function handleSend() {
    if (!input.trim() || !setup) return;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    await requestNextTurn(nextMessages, setup);
  }

  function renderVoiceSettings() {
    if (!speechSupported) return null;
    return (
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Reading voice</label>
          <select
            value={voiceURI}
            onChange={(e) => setVoiceURI(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
          >
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 flex justify-between text-sm font-medium">
            <span>Speaking rate</span>
            <span className="text-neutral-400">{speechRate.toFixed(1)}x</span>
          </label>
          <input
            type="range"
            min={0.5}
            max={1.75}
            step={0.05}
            value={speechRate}
            onChange={(e) => setSpeechRate(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  if (!setup) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <h1 className="mb-1 text-xl font-semibold">Mock Interview Setup</h1>
        <p className="mb-6 text-sm text-neutral-500">
          A Staff QA Engineer persona will ask questions one at a time, evaluate each answer, and
          end with a Hire / No-Hire scorecard.
        </p>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Target Role</label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ROLE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, role: p })}
                  className="rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Experience Level</label>
            <input
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {EXPERIENCE_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, experience: p })}
                  className="rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Focus Domain</label>
            <input
              value={form.focus}
              onChange={(e) => setForm({ ...form, focus: e.target.value })}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {FOCUS_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, focus: p })}
                  className="rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <details className="rounded-lg border border-neutral-300 dark:border-neutral-700">
            <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium">
              Advanced options
            </summary>
            <div className="space-y-4 border-t border-neutral-200 dark:border-neutral-800 p-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Number of questions</label>
                <div className="flex flex-wrap gap-1.5">
                  {NUM_QUESTIONS_PRESETS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, numQuestions: n })}
                      className={`rounded-full border px-2.5 py-1 text-xs ${
                        form.numQuestions === n
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Interview style</label>
                <div className="flex flex-wrap gap-1.5">
                  {DIFFICULTY_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm({ ...form, difficulty: d })}
                      className={`rounded-full border px-2.5 py-1 text-xs ${
                        form.difficulty === d
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              {renderVoiceSettings()}
            </div>
          </details>

          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  const expectedTurns = setup.numQuestions + 1; // + final scorecard
  const visibleMessages = messages.filter((m) => !m.hidden);
  const turnsCompleted = Math.min(
    visibleMessages.filter((m) => m.role === "assistant").length,
    expectedTurns
  );
  const progressPct = (turnsCompleted / expectedTurns) * 100;
  const hasAssistantMessage = visibleMessages.some((m) => m.role === "assistant");

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-3xl flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Mock Interview — {setup.role}</h1>
          <p className="text-sm text-neutral-500">
            {setup.experience} • {setup.focus} • {setup.difficulty} • {setup.numQuestions} questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {speechSupported && (
            <label className="flex items-center gap-1.5 text-sm text-neutral-500">
              <input
                type="checkbox"
                checked={voiceMode}
                onChange={(e) => setVoiceMode(e.target.checked)}
              />
              🎙️ Voice
            </label>
          )}
          <button
            type="button"
            onClick={() => setSetup(null)}
            className="text-sm text-neutral-500 hover:underline"
          >
            Restart
          </button>
        </div>
      </div>

      {speechSupported && hasAssistantMessage && (
        <details className="mb-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <summary className="cursor-pointer select-none px-3 py-1.5 text-xs font-medium text-neutral-500">
            Advanced options — voice playback
          </summary>
          <div className="space-y-3 border-t border-neutral-200 dark:border-neutral-800 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={speaking ? handlePauseResume : handleReplay}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                {speaking ? (speechPaused ? "▶ Resume" : "⏸ Pause") : "▶ Play question"}
              </button>
              <button
                type="button"
                onClick={handleStopSpeaking}
                disabled={!speaking}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-40"
              >
                ⏹ Stop
              </button>
              <button
                type="button"
                onClick={handleReplay}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                🔁 Replay
              </button>
            </div>
            {renderVoiceSettings()}
          </div>
        </details>
      )}

      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        {visibleMessages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {loading && <TypingIndicator label="Interviewer is typing…" />}
        {error && (
          <div className="flex items-center gap-3 text-sm text-red-500">
            <span>{error}</span>
            {lastFailedTurn && (
              <button
                type="button"
                onClick={() =>
                  requestNextTurn(lastFailedTurn.nextMessages, lastFailedTurn.activeSetup)
                }
                className="rounded-full border border-red-300 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/40"
              >
                Retry
              </button>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex items-end gap-2">
        {speechSupported && voiceMode && (
          <button
            type="button"
            onClick={toggleListening}
            title={listening ? "Stop recording" : "Speak your answer"}
            className={`rounded-lg border px-3 py-2 text-sm ${
              listening
                ? "border-red-400 bg-red-50 text-red-600 dark:bg-red-950/40"
                : "border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            }`}
          >
            {listening ? "⏹️" : "🎤"}
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your answer…"
          rows={1}
          className="flex-1 resize-none rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

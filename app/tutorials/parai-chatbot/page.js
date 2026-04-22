"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Send, Loader2 } from "lucide-react";

function formatAssistantText(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h3 key={i} className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">
          {line.slice(3)}
        </h3>
      );
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <p key={i} className="ml-4 text-slate-700 dark:text-slate-300">
          • {line.slice(2)}
        </p>
      );
    }
    if (!line.trim()) {
      return <br key={i} />;
    }
    return (
      <p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed">
        {line}
      </p>
    );
  });
}

export default function ParaiChatbotPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi — I’m the Parai chatbot. Ask about strokes, nilai, history, or ask me to suggest videos and articles. Replies use Claude under the hood.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const scrollDown = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const send = useCallback(async () => {
    const q = input.trim();
    if (!q || loading) return;
    setError("");
    setInput("");
    const next = [...messages, { role: "user", content: q }];
    setMessages(next);
    setLoading(true);
    scrollDown();

    try {
      const res = await fetch("/api/chat/parai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "Sorry — something went wrong. Check the API key or try again." },
        ]);
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.text || "" }]);
    } catch (e) {
      setError(e.message || "Network error");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Network error — try again in a moment." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(scrollDown, 100);
    }
  }, [input, loading, messages]);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient-neon">Parai chatbot</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm">
              Powered by Claude — cultural context, practice help, and curated search links for videos &
              articles.
            </p>
          </div>
          <Link href="/dashboard" className="btn-future-ghost text-sm !py-2 !px-4 rounded-xl shrink-0">
            ← Dashboard
          </Link>
        </div>

        <div className="rounded-3xl glass-panel-strong border-red-400/20 overflow-hidden flex flex-col h-[min(72vh,640px)]">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-2xl px-4 py-3 max-w-[95%] ${
                  m.role === "user"
                    ? "ml-auto bg-red-600/90 text-white"
                    : "mr-auto glass-panel border-red-400/15"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="text-sm space-y-1">{formatAssistantText(m.content)}</div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-sm px-2">
                <Loader2 className="animate-spin" size={18} />
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="px-4 text-sm text-red-600 dark:text-red-400 border-t border-red-400/15 py-2">
              {error}
            </p>
          )}

          <div className="p-3 sm:p-4 border-t border-red-400/15 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Ask about Parai, nilai, or request learning resources…"
              className="flex-1 rounded-xl bg-white/10 dark:bg-black/20 border border-red-400/20 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400/40"
              disabled={loading}
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !input.trim()}
              className="btn-future-primary rounded-xl px-4 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500 text-center">
          Configure <code className="text-red-600/90">ANTHROPIC_API_KEY</code> in your environment. Optional:{" "}
          <code className="text-red-600/90">ANTHROPIC_MODEL</code>.
        </p>
      </div>
    </div>
  );
}

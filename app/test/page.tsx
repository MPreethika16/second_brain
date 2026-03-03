"use client";

import { useState } from "react";

export default function TestPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  const saveNote = async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  };

  const askQuestion = async () => {
    const res = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });

    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Backend Test Page</h1>

      <h2>Save Note</h2>
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />
      <button onClick={saveNote}>Save Note</button>

      <h2 style={{ marginTop: 40 }}>Ask Question</h2>
      <input
        placeholder="Ask something..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />
      <button onClick={askQuestion}>Ask</button>

      <pre style={{ marginTop: 40 }}>{response}</pre>
    </div>
  );
}
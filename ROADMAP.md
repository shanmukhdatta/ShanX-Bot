# ShanXBot — Feature Roadmap 🚀

> **35 planned features** to transform ShanXBot from a great chatbot into a world-class AI assistant platform.
> Each feature includes implementation hints so you can pick up any item and start building.

---

## Table of Contents

- [⚡ Super Intelligence Mode Enhancements](#-super-intelligence-mode-enhancements) — Features 1–5
- [🧠 AI Intelligence Features](#-ai-intelligence-features) — Features 6–10
- [📄 RAG & Document Features](#-rag--document-features) — Features 11–15
- [🎨 UI / UX Features](#-ui--ux-features) — Features 16–20
- [🔊 Voice & Multimodal](#-voice--multimodal) — Features 21–24
- [📊 Analytics & Insights](#-analytics--insights-right-panel) — Features 25–28
- [🔧 Developer / Power User](#-developer--power-user) — Features 29–32
- [🌐 Collaboration & Sharing](#-collaboration--sharing) — Features 33–35
- [🐛 Known Bug Fixes](#-known-bug-fixes)

---

## ⚡ Super Intelligence Mode Enhancements

### Feature 1 — Confidence Score Display

**What it does:**
After the Judge AI synthesizes a response, display a numeric confidence score (0–100%) as a badge on the final message bubble. The score is derived from how much Model A and Model B agreed with each other — high textual overlap and semantic similarity = high confidence, wildly different answers = low confidence.

**Why it matters:**
Gives the user an instant signal about how reliable the answer is. A 92% confidence response can be trusted outright; a 41% response tells the user to verify externally.

**Implementation hints:**
- Backend: After getting both model responses, compute cosine similarity between their embeddings (use `sentence-transformers` or a lightweight Groq embedding call). Map the similarity score to a 0–100 range.
- Return `confidence_score` in the `/chat/superintel` JSON response alongside `final_response`.
- Frontend: In `MessageBubble.jsx`, check for `message.superIntelData.confidence_score` and render a pill badge — green for >75, amber for 50–75, red for <50.

---

### Feature 2 — Model Disagreement Highlighter

**What it does:**
When the two models gave meaningfully different answers, automatically highlight the specific sentences in the final synthesized response where the Judge had to make a hard call. Hovering the highlight shows a tooltip with a mini side-by-side of what each model said for that point.

**Why it matters:**
Transparency into AI reasoning is a major trust signal. Users can see exactly where uncertainty exists rather than getting a seamlessly confident-sounding answer that is actually contested.

**Implementation hints:**
- Backend: After synthesis, ask the Judge AI a follow-up prompt: "Which sentences in your final answer represent a decision where Model A and Model B disagreed? Return a JSON list of those sentence strings."
- Store as `contested_sentences: []` in the response payload.
- Frontend: In `MessageBubble.jsx`, after markdown renders, do a string search for contested sentences and wrap them in a `<mark>` styled with amber underline. Add a Tooltip component on hover.

---

### Feature 3 — Response Quality Meter

**What it does:**
A small visual bar below every Super Intelligence response labeled "Synthesis Quality." It factors in: response length relative to question complexity, model agreement level, whether the Judge cited specific reasoning, and absence of hedging phrases ("I'm not sure", "it depends").

**Why it matters:**
Gives users a quick gut-check on whether they got a thorough answer or a generic one, without reading every word.

**Implementation hints:**
- Compute server-side: length score (normalized), agreement score (from Feature 1), reasoning depth score (count of logical connectors like "because", "therefore", "however").
- Return `quality_score: { total, breakdown }` in the API response.
- Frontend: Render as a thin segmented bar in 3 color zones below the message bubble, with a popover on hover showing the breakdown.

---

### Feature 4 — Retry with Different Model Pairs

**What it does:**
A "Retry with different models" button appears below every Super Intelligence response. Clicking it opens a small popover where the user can choose a different model combination (e.g., Mistral + Claude instead of Groq + Gemini) and re-run the exact same query instantly.

**Why it matters:**
Different model pairs have different strengths — Groq + Gemini is fast, but Claude + GPT-4 may give a deeper answer for complex reasoning tasks. Letting users explore this without retyping is powerful.

**Implementation hints:**
- Add a `model_pair` field to the `/chat/superintel` request body with options like `groq+gemini`, `groq+openrouter`, `openrouter+gemini`.
- Backend: Branch the parallel execution based on `model_pair`.
- Frontend: Add a retry button component in `MessageBubble.jsx` that opens a `<select>` popover and calls `sendMessage()` again with the chosen pair pre-set.

---

### Feature 5 — Side-by-Side Mode

**What it does:**
An optional toggle in the Super Intelligence panel that shows Model A's raw response and Model B's raw response in two columns side by side, before the synthesized answer appears below. The user can read both independently and then see how the Judge combined them.

**Why it matters:**
Power users and researchers want to see the raw reasoning of each model, not just the final synthesis. This makes ShanXBot a genuine research and comparison tool.

**Implementation hints:**
- The raw model responses are already returned in the API response as `model1_response` and `model2_response`. This is mostly a frontend feature.
- Add a toggle in `RightPanel.jsx` or `SettingsModal.jsx` for "Side-by-side mode" saved to `settingsStore`.
- In `MessageBubble.jsx`, when `superIntelData` exists and side-by-side is enabled, render a two-column grid above the synthesized answer instead of the collapsible dropdown currently there.

---

## 🧠 AI Intelligence Features

### Feature 6 — Memory / Persistent Context

**What it does:**
ShanXBot remembers key facts about the user across sessions — their name, profession, ongoing projects, preferences, and any facts they explicitly share. These are stored locally and injected into every system prompt automatically so the model always has personal context.

**Why it matters:**
The biggest pain point with AI chatbots is re-explaining yourself every session. Memory makes ShanXBot feel like a personal assistant rather than a stateless tool.

**Implementation hints:**
- Create a `memoryStore.js` in Zustand with a `facts: []` array, persisted to localStorage.
- After each AI response, run a background call to a lightweight model: "Extract any personal facts the user shared in this message. Return JSON array of `{key, value}` pairs." Merge into the facts store.
- Prepend a "What you know about me:" section to the system prompt using facts from the store.
- Add a "Memory" tab in `SettingsModal.jsx` where users can view, edit, and delete stored facts.

---

### Feature 7 — Auto Mode Selector

**What it does:**
Before sending a message, ShanXBot analyzes the query complexity using a fast heuristic (word count, presence of multi-part questions, technical keywords, ambiguity signals) and automatically switches to Super Intelligence mode for complex queries and stays in Standard mode for simple ones. The user sees a subtle indicator showing which mode was auto-selected.

**Why it matters:**
Most users don't think about which mode to use — they just want the best answer. Auto-selection removes friction while ensuring expensive Super Intel calls are only made when they add value.

**Implementation hints:**
- Build a client-side `classifyQuery(text)` function: score based on word count >30, presence of "compare", "analyze", "explain why", "difference between", multiple question marks, etc.
- If score exceeds threshold, temporarily override `mode` to `superintelligence` for that single send only.
- Show a small "⚡ Auto: Super Intel" or "● Auto: Standard" badge in the input bar that appears for 1.5s before sending.

---

### Feature 8 — Chain of Thought Display

**What it does:**
A collapsible "Reasoning" section appears below the AI response showing the step-by-step reasoning the model went through before arriving at the answer. Rendered as a numbered timeline with each step as a thought node.

**Why it matters:**
Chain-of-thought reasoning dramatically improves answer quality for complex problems, and showing it to users builds trust and helps them catch errors in logic.

**Implementation hints:**
- Backend: Add `"show_reasoning": true` to the Groq API call and use a system prompt addition: "First, think step by step inside `<thinking>` tags. Then give your final answer."
- Parse the `<thinking>...</thinking>` section out of the response server-side before sending to frontend.
- Return as `reasoning_steps: ["step1", "step2", ...]` in the API response.
- Frontend: Add a collapsible `ReasoningPanel` component inside `MessageBubble.jsx`.

---

### Feature 9 — Fact Check Mode

**What it does:**
A toggle in settings enables "Fact Check Mode." When active, after every AI response, a secondary lightweight API call checks the response for potentially hallucinated claims (specific numbers, dates, names, URLs) and flags them inline with a ⚠️ icon. Clicking the icon shows a note: "This claim could not be independently verified."

**Why it matters:**
Hallucination is the #1 trust problem with LLMs. Inline flagging lets users use the tool confidently without blindly trusting every detail.

**Implementation hints:**
- Backend: After the primary response, send a follow-up prompt to a fast model: "In this text, identify any specific factual claims (dates, numbers, proper nouns, URLs) that you are less than 90% confident about. Return as JSON: `[{claim, reason}]`."
- Return `unverified_claims: []` alongside the response.
- Frontend: After markdown renders, scan the output for claim strings and wrap them in a styled `<span>` with a warning icon tooltip.

---

### Feature 10 — Multi-turn Summarization

**What it does:**
When a conversation exceeds 10 messages, ShanXBot automatically compresses older messages into a concise summary and uses that summary as context instead of the full history. The user sees a small "Context compressed" indicator in the chat. They can click it to view the full summary.

**Why it matters:**
Long conversations hit token limits fast and degrade answer quality. Smart compression keeps the model context fresh and relevant without losing important thread history.

**Implementation hints:**
- In `handleStreamChat`, before building the `messages` array for the API call, check `messages.length > 10`.
- If so, take `messages[0..messages.length-6]` and call a summarization endpoint: "Summarize this conversation history in 150 words, preserving key facts, decisions, and context."
- Replace the old messages with a single `{role: "system", content: "Conversation summary: ..."}` message in the API payload.
- Store the summary in `chatStore` per session and show a collapsible "📋 Context Summarized" banner in the messages area.

---

## 📄 RAG & Document Features

### Feature 11 — Citation Highlighting

**What it does:**
When the AI answers using information from an uploaded document, each claim in the response is linked to its source chunk. Inline citation markers like `[1]` appear in the text, and a "Sources" section below the response shows the exact excerpt from the document with page/line reference.

**Why it matters:**
RAG answers without citations feel no different from hallucinations. Grounding responses in visible, clickable sources is the difference between a toy and a production research tool.

**Implementation hints:**
- Backend: After FAISS retrieval, preserve the chunk metadata (page number, character offset, chunk index) alongside each retrieved chunk.
- Modify the RAG prompt to instruct the model: "When using information from the document, cite it as [CHUNK_1], [CHUNK_2], etc."
- Parse `[CHUNK_N]` references from the response, replace with superscript markers, and return `citations: [{marker, text, page}]` in the response.
- Frontend: Render a `Citations` accordion below the message bubble with each source excerpt in a styled card.

---

### Feature 12 — Multi-Document Support

**What it does:**
Users can upload multiple documents simultaneously and have them all indexed in the same FAISS vector store. The right panel shows a list of active documents, each with a toggle to enable/disable it from the retrieval pool. The model answers from across all active documents.

**Why it matters:**
Real research workflows involve multiple sources — a research paper, a dataset description, and a methodology guide all at once. Single-document RAG is a significant limitation.

**Implementation hints:**
- Backend: Namespace FAISS chunks by `doc_id`. When retrieving, filter by the list of active `doc_ids` passed in the request.
- Store documents as `{ id, filename, chunkCount, active }` in a `docs` list in the RAG status store.
- Frontend: Redesign the right panel upload zone into a document manager list with toggle switches per document.
- Pass `active_doc_ids: []` in every `/chat/stream` request body.

---

### Feature 13 — Document Q&A History

**What it does:**
Every document uploaded gets its own separate chat history. Switching between documents in the right panel loads the conversation history tied to that document. Users can revisit past Q&A sessions for any previously uploaded file.

**Why it matters:**
Users often revisit the same document across multiple work sessions. Persistent per-document history eliminates the need to re-ask the same orientation questions every time.

**Implementation hints:**
- In `chatStore.js`, add a `docSessions: { [docId]: sessionId }` map.
- When a document is activated in the right panel, create or restore the session tied to that `docId`.
- Tag sessions with `{ ..., docId: string | null }` so they can be filtered in the sidebar.
- Add a "Document Chats" section in the sidebar below regular sessions.

---

### Feature 14 — Auto Document Summary on Upload

**What it does:**
Immediately after a document is uploaded and indexed, ShanXBot automatically generates a 3-bullet-point summary card of the document's key topics and displays it in the right panel as a "Document Overview" widget. This also shows estimated reading time and total chunk count.

**Why it matters:**
Users often upload large documents without knowing what's in them. An instant summary orients the user and suggests what kinds of questions to ask.

**Implementation hints:**
- Backend: In the `/rag/upload` endpoint, after chunking, take the first 3000 characters of the document and run: "Summarize this document in exactly 3 bullet points. Focus on the main topic, key findings, and practical takeaways."
- Return `summary: ["bullet1", "bullet2", "bullet3"]` in the upload response.
- Frontend: In `RightPanel.jsx`, render a summary card below the upload zone when `ragStatus.summary` is populated.

---

### Feature 15 — Web RAG

**What it does:**
The user can paste any public URL into the input bar (or a dedicated URL field in the right panel). ShanXBot fetches the page content, strips HTML, chunks it, indexes it in FAISS, and treats it exactly like an uploaded document. The RAG badge shows the domain name as the source.

**Why it matters:**
Most knowledge workers need to ask questions about web content — articles, documentation pages, Wikipedia entries — not just local files. Web RAG makes ShanXBot a universal research assistant.

**Implementation hints:**
- Backend: Create a `/rag/url` endpoint. Use `httpx` to fetch the URL, `BeautifulSoup` to extract text, then chunk and index it identically to document uploads.
- Detect URLs in the frontend input bar using a regex; if a URL is detected and the user hits send, prompt: "Index this URL and ask a question about it, or just index it?"
- Handle rate limits and robots.txt gracefully with proper error messages.

---

## 🎨 UI / UX Features

### Feature 16 — Chat Themes

**What it does:**
A theme picker in Settings with at least 4 visual themes: the current Emerald Glass (default), Dark Mode (deep navy + purple accents), Solarized (warm cream + teal), and Cyberpunk (black + neon cyan). Themes apply instantly with a smooth CSS transition and persist across sessions.

**Why it matters:**
Visual personalization dramatically increases user attachment to a tool. Dark mode alone is expected by most users. Themes make ShanXBot feel polished and professional.

**Implementation hints:**
- Define themes as CSS variable sets in `index.css`: `[data-theme="dark"] { --primary: #7c3aed; --bg: #0f0f1a; ... }`.
- Store `theme` in `settingsStore.js`.
- On mount and theme change, set `document.documentElement.setAttribute('data-theme', theme)`.
- Replace all hardcoded color values in components with CSS variables so themes propagate automatically.

---

### Feature 17 — Message Reactions

**What it does:**
Hovering a completed AI message reveals a small reaction bar with 👍 👎 and emoji options (🔥 💡 ❓). Clicking a reaction saves it to that message in the store. The thumbs down triggers a small optional feedback textarea: "What was wrong with this response?" Reactions are stored locally and can be exported.

**Why it matters:**
Reaction data is incredibly valuable feedback for understanding which responses were actually helpful. It also gives users a sense of control and expression, increasing engagement.

**Implementation hints:**
- Add `reactions: string[]` and `feedback: string | null` to the message object schema in `chatStore`.
- Add `addReaction(msgId, emoji)` and `addFeedback(msgId, text)` actions to the store.
- In `MessageBubble.jsx`, show a floating reaction bar on `onMouseEnter` of the message container using absolute positioning.
- Store aggregated reaction stats per session; include in the Export Chat feature (Feature 28).

---

### Feature 18 — Response Regeneration

**What it does:**
A "Regenerate" button appears below every completed AI message. Clicking it resends the last user message to the API, replaces the current AI response with the new one in-place, and streams the new answer. An optional model picker lets users regenerate with a different model.

**Why it matters:**
LLM responses are non-deterministic. Sometimes the first answer misses the mark. One-click regeneration is a standard feature users expect from any serious AI chat product.

**Implementation hints:**
- Add a `regenerate(messageId)` action to `chatStore` that removes the last AI message and re-triggers `sendMessage` with the previous user message content.
- The tricky part is preserving the correct session state — make sure the user message is not re-added as a duplicate.
- Add a small "↻ Regenerate" button in `MessageBubble.jsx` visible on hover for assistant messages, hidden during streaming.

---

### Feature 19 — Conversation Branching

**What it does:**
At any message in the chat, a "Branch from here" button creates a new parallel session that starts with the conversation history up to that point. The user can then explore a completely different direction without losing the original thread. Branched sessions appear in the sidebar with a tree icon and reference to the parent session.

**Why it matters:**
Conversation branching is how power users actually think — they want to explore "what if I had asked this instead" without destroying their current thread. It's a superpower feature that almost no chatbot offers.

**Implementation hints:**
- Add `parentSessionId: string | null` and `branchedAtMessageIndex: number | null` to the session object.
- Add a `branchFrom(sessionId, messageIndex)` action that creates a new session pre-populated with `messages.slice(0, messageIndex + 1)`.
- In the sidebar, group branched sessions under their parent with indentation and a connecting line.

---

### Feature 20 — Pin Important Messages

**What it does:**
A pin icon on any AI message saves it to a "Pinned Answers" section in the right panel. Pinned messages persist across sessions and are searchable. The right panel shows pinned messages as compact cards with a snippet, timestamp, and a "Jump to" link that opens the source session.

**Why it matters:**
Users often want to reference a great explanation they got earlier without scrolling through entire chat history. Pinning is a lightweight personal knowledge base.

**Implementation hints:**
- Add a `pinnedMessages: Message[]` array to `chatStore`, persisted in localStorage.
- Add `pinMessage(msg)` and `unpinMessage(msgId)` actions.
- In `MessageBubble.jsx`, add a pin icon (📌) on hover alongside the reaction bar.
- In `RightPanel.jsx`, add a "Pinned" tab that renders the pinned messages list.

---

## 🔊 Voice & Multimodal

### Feature 21 — Text-to-Speech Playback

**What it does:**
A speaker icon on every AI message reads the response aloud when clicked. By default it uses the browser's built-in Web Speech Synthesis API. An optional ElevenLabs API key in Settings unlocks higher quality voice with voice character selection (professional, friendly, etc.). A floating playback bar shows progress and allows pause/stop.

**Why it matters:**
TTS makes ShanXBot usable while multitasking, commuting, or for users with reading difficulties. It transforms the interface from a reading tool into a conversation partner.

**Implementation hints:**
- Browser TTS: `const utterance = new SpeechSynthesisUtterance(text); speechSynthesis.speak(utterance)`. Handle chunking for long responses.
- ElevenLabs: POST to `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}` with the text. Stream the audio blob and play via `<audio>` element.
- Add `elevenlabsKey` and `selectedVoice` to `settingsStore`.
- Create a `useTTS()` hook that abstracts both providers and exposes `speak(text)`, `pause()`, `stop()`, `isPlaying`.

---

### Feature 22 — Image Input Support

**What it does:**
Users can drag and drop an image file into the chat, paste an image from clipboard (Ctrl+V), or click an image icon in the input bar. The image is sent to a vision-capable model (Gemini 1.5 Pro or GPT-4V via OpenRouter) along with any text message. The AI can describe, analyze, extract text from, or answer questions about the image.

**Why it matters:**
Vision capability is now a baseline expectation for advanced AI tools. Screenshots, diagrams, charts, equations — all become queryable inputs.

**Implementation hints:**
- In `InputBar.jsx`, add paste event listener: `document.addEventListener('paste', handlePaste)`. Check `event.clipboardData.items` for image types.
- Convert image to base64. Store in local state as `attachedImage: { base64, mimeType }`.
- Backend: If an image is present in the request, route to the Gemini or GPT-4V endpoint with `content: [{"type": "image_url", ...}, {"type": "text", ...}]`.
- Show image thumbnail preview in the input bar before sending.

---

### Feature 23 — Voice Commands

**What it does:**
Beyond dictation, the voice input system recognizes specific command phrases. "Clear chat" clears the current session. "Switch to super mode" toggles Super Intelligence. "Read that back" triggers TTS on the last response. "New chat" creates a new session. Commands are detected client-side via keyword matching after transcription.

**Why it matters:**
Hands-free control of the interface makes ShanXBot genuinely useful in scenarios where typing is inconvenient — cooking, driving (passenger), or accessibility scenarios.

**Implementation hints:**
- After Web Speech API transcription, before setting the input text, run `parseCommand(transcript)`.
- Build a command registry: `{ trigger: string | RegExp, action: () => void }[]`.
- If a command matches, execute it and skip the normal send flow (don't append to input or send as a chat message).
- Show a transient toast notification: "✓ Command: Clear chat" for user feedback.

---

### Feature 24 — Screenshot Paste

**What it does:**
When the user presses Ctrl+V with an image in their clipboard (e.g., a screenshot), ShanXBot detects the image, shows a preview thumbnail in the input area, and automatically includes it in the next message sent. A "Remove" button discards the attached image. Works seamlessly alongside typed text.

**Why it matters:**
Screenshot pasting is the most natural interaction pattern for visual queries — users take a screenshot of an error message, a chart, or a diagram and immediately paste it into the chat. Removing friction here dramatically increases the use of image input.

**Implementation hints:**
- This is the paste detection piece of Feature 22 as a standalone, more polished interaction.
- On paste detection, show an image preview card above the textarea with filename, dimensions, and a remove (×) button.
- Display a subtle hint text in the placeholder: "Type a message, paste an image (Ctrl+V), or press the mic..."
- Ensure the image is cleared from state after it's sent, not persisted across messages.

---

## 📊 Analytics & Insights (Right Panel)

### Feature 25 — Token Usage Tracker

**What it does:**
Below every message, a tiny "X tokens" label shows the approximate token count for that exchange. The right panel shows cumulative session stats: total tokens used, estimated cost in USD (based on the active model's pricing), and a breakdown of user tokens vs assistant tokens.

**Why it matters:**
API costs are real and often invisible to users. Token tracking lets users understand the cost of their usage, optimize their prompts, and stay within free tier limits.

**Implementation hints:**
- Backend: Return `usage: { prompt_tokens, completion_tokens, total_tokens }` from the API. Groq and Gemini both provide this in their response objects.
- Store token counts in the message object in `chatStore`.
- Create a pricing map in `settingsStore`: `{ "llama-3.3-70b": { input: 0.59, output: 0.79 } }` (per million tokens).
- Right panel: Running total with a small cost estimate like "~$0.003 this session."

---

### Feature 26 — Response Time Graph

**What it does:**
A mini line chart in the right panel showing response latency (in seconds) for each message in the current session, plotted chronologically. Hover a data point to see which message it was and the exact time. A horizontal dotted line shows the session average.

**Why it matters:**
Response time visibility helps users understand model performance, identify slow periods (API throttling, complex queries), and choose between speed-optimized vs quality-optimized models.

**Implementation hints:**
- Record `responseTime: number` (ms) on every message from `Date.now()` difference between send and first token received.
- Store in the message object in `chatStore`.
- In `RightPanel.jsx`, render a lightweight SVG line chart (no library needed — just path and circle elements) from the session's response time array.
- Color the line green < 2s, amber 2–5s, red > 5s.

---

### Feature 27 — Model Performance Comparison

**What it does:**
After at least 3 Super Intelligence responses, a "Performance" card appears in the right panel showing aggregate stats: average Groq response time, average Gemini response time, average synthesis time, and which model "won" (whose response the Judge used more). Shown as a simple table with emoji indicators.

**Why it matters:**
Data nerds and developers want to understand how the models compare in practice on their own queries. This turns ShanXBot into a lightweight model benchmarking tool.

**Implementation hints:**
- Backend: Return `timing: { groq_ms, gemini_ms, judge_ms }` and `dominant_model: "groq" | "gemini"` in the Super Intel response.
- Store these in the `superIntelData` object on the message.
- Aggregate stats in a derived selector or `useMemo` in `RightPanel.jsx`.
- Show a simple two-row comparison table with mini bar charts.

---

### Feature 28 — Export Chat

**What it does:**
A "Export" button in the sidebar generates a downloadable file of the current chat session. Three format options: PDF (styled, with ShanXBot branding), Markdown (clean `.md` file), or JSON (raw message array with all metadata). The export respects pinned messages, reactions, and token counts.

**Why it matters:**
Chat history is knowledge. Users want to save, share, and reference their AI conversations externally — in notes apps, documents, team wikis, or personal archives.

**Implementation hints:**
- Markdown: Build the string in JS from the messages array and trigger a download with `URL.createObjectURL(new Blob([content], { type: 'text/markdown' }))`.
- JSON: `JSON.stringify(session.messages, null, 2)` and download as `.json`.
- PDF: Use `jsPDF` + `html2canvas` — render a hidden styled `<div>` with the chat content and capture it to PDF.
- Add an "Export" button with a format picker dropdown in the `Sidebar.jsx` session context menu.

---

## 🔧 Developer / Power User

### Feature 29 — Prompt Playground

**What it does:**
A full-screen Playground mode (accessible from the sidebar) with a two-panel layout: left panel for writing/editing a system prompt with syntax highlighting, right panel for a live test chat using that prompt. Users can A/B compare two prompts side by side in split mode. Playgrounds can be saved and named.

**Why it matters:**
Prompt engineering is a core skill for power users and developers. A built-in playground removes the need for external tools like Anthropic Console or OpenAI Playground.

**Implementation hints:**
- Create a new route/view `PlaygroundView.jsx`.
- Left panel: Use `react-simple-code-editor` or a `<textarea>` with monospace font and basic line numbers.
- Right panel: A stripped-down chat interface that uses the draft system prompt instead of the saved one.
- Save playgrounds to `settingsStore` as `playgrounds: [{ id, name, systemPrompt }]`.

---

### Feature 30 — API Request Inspector

**What it does:**
A toggleable "Inspector" panel (think browser DevTools but for AI) shows the raw JSON payload sent to the backend and the raw JSON response received, for every message. Includes request headers (with API keys masked), response status, timing breakdown, and full token usage. Expandable per message.

**Why it matters:**
Developers building on top of ShanXBot or debugging prompt issues need to see exactly what's going in and out. This is a must-have for a developer-oriented chatbot.

**Implementation hints:**
- In `handleStreamChat` and `handleSuperIntel`, capture and store the request body and response data alongside the message.
- Add `requestDebug: { request, response, timing }` to the message object (only in dev mode or when inspector is enabled).
- Create an `InspectorPanel.jsx` overlay that renders as a slide-in drawer from the right.
- Toggle via a `</>` button in `TopBar.jsx`.

---

### Feature 31 — Custom Model Endpoints

**What it does:**
In the Settings "Models" tab, users can add a custom API endpoint (any OpenAI-compatible URL), a model name string, and an API key. This allows pointing ShanXBot at a local Ollama instance, an LM Studio server, a Together AI endpoint, or any self-hosted model — without modifying the backend code.

**Why it matters:**
Developers running local models want ShanXBot's UI without being locked into cloud APIs. This single feature opens ShanXBot to the entire self-hosted LLM ecosystem.

**Implementation hints:**
- Add `customEndpoints: [{ id, name, baseUrl, modelId, apiKey }]` to `settingsStore`.
- Backend: Add a `/chat/custom` endpoint that accepts `base_url`, `model`, and `api_key` and makes an OpenAI-compatible call using `httpx` with the provided endpoint.
- The OpenAI Python SDK supports custom `base_url`: `OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")`.
- Frontend: Add custom endpoints to the model selector dropdown in `InputBar.jsx`.

---

### Feature 32 — Keyboard Shortcuts

**What it does:**
A comprehensive keyboard shortcut system for all major actions. `Ctrl+/` creates a new chat. `Ctrl+Shift+S` toggles Super Intelligence mode. `Esc` stops the current streaming response. `↑` in an empty input bar loads the previous message for editing. `Ctrl+K` opens a command palette. A shortcut reference sheet appears on `?` key.

**Why it matters:**
Power users live by keyboard shortcuts. Adding them signals that ShanXBot is a serious productivity tool, not just a demo. It also dramatically speeds up heavy-usage workflows.

**Implementation hints:**
- Create a `useKeyboardShortcuts()` hook with a `keydown` event listener in `App.jsx`.
- Map key combinations to store actions: `createSession()`, `setMode(...)`, `abortRef.current?.abort()`.
- For the `↑` edit-previous behavior, check if `inputValue === ''` in `InputBar.jsx`'s keydown handler, then load `messages[messages.length-2].content`.
- Build a `CommandPalette.jsx` modal triggered by `Ctrl+K` that fuzzy-searches all available actions.

---

## 🌐 Collaboration & Sharing

### Feature 33 — Share Conversation Link

**What it does:**
A "Share" button in the sidebar generates a unique public URL for the current session. Anyone with the link can view a read-only, beautifully rendered version of the conversation in a clean web page — no account required. The shared page shows the ShanXBot branding, all messages with proper markdown rendering, and timestamps.

**Why it matters:**
Sharing AI conversations is a growing social behavior. Researchers share useful Q&A threads, developers share debugging sessions, and students share study conversations. A native share feature makes this seamless.

**Implementation hints:**
- Backend: Add a `POST /share` endpoint that takes a session's messages, stores them in a simple database or Redis with a UUID key, and returns the share URL.
- `GET /share/{uuid}` returns the stored messages as JSON or pre-rendered HTML.
- Frontend: Create a `SharedView.jsx` component at route `/s/:uuid` that fetches and renders the shared session.
- Add an expiry option (24h, 7 days, permanent) when generating the share link.

---

### Feature 34 — Export as Blog Post

**What it does:**
A "Publish as Article" option in the export menu sends the conversation to the AI and says: "Convert this Q&A conversation into a well-structured article with an introduction, headings, prose paragraphs, and a conclusion." The result opens in a new editor view where the user can tweak it before copying or downloading as Markdown or HTML.

**Why it matters:**
Conversations with AI often contain genuinely valuable knowledge. Converting them into publishable articles unlocks this value for blogs, documentation, and team wikis — turning ephemeral chats into lasting content.

**Implementation hints:**
- Create a `POST /export/article` backend endpoint that calls the LLM with the conversation-to-article prompt.
- Stream the article response into a new `ArticleEditorView.jsx` — a simple `<textarea>` with markdown preview on the right.
- Add a "Copy Markdown" and "Download HTML" button with proper formatting.
- Link this from the export dropdown in the sidebar (Feature 28).

---

### Feature 35 — Team Workspaces

**What it does:**
A Workspace system allows multiple users to share a ShanXBot environment. The workspace owner can invite collaborators via email link. Collaborators can view shared sessions in real time (read-only mode) or edit together (collaborative mode with turn-based sending). Sessions are tagged as "Personal" or "Team" in the sidebar.

**Why it matters:**
Teams increasingly do research, drafting, and analysis together using AI tools. A collaborative workspace turns ShanXBot from a solo tool into a team productivity platform — similar to how Notion or Figma transformed individual software into team software.

**Implementation hints:**
- This is the most backend-heavy feature on the list. Requires: user authentication (JWT), a proper database (PostgreSQL or Supabase), workspace data model, and WebSocket for real-time sync.
- Start with Supabase for auth + database + real-time subscriptions — it handles the hard parts.
- Frontend: Add a workspace switcher in the sidebar top area. Add user avatars on messages showing who sent what.
- For real-time: subscribe to Supabase Realtime on the shared session's message table and update the chat store on new rows.

---

## 🐛 Known Bug Fixes

These are existing issues in the current codebase that should be addressed before or alongside new feature development:

| # | Bug | Location | Fix |
|---|-----|----------|-----|
| B1 | `setSuperIntelStep(0)` fires before `setStreaming(false)` causing panel flicker | `App.jsx` `handleSuperIntel` finally block | Move step reset into the try block after streaming completes, not finally |
| B2 | `superIntelTiming` never resets between requests — old timestamps bleed in | `App.jsx` `handleSuperIntel` | Add `setSuperIntelTiming({})` reset at the start of each call |
| B3 | `ThinkingIndicator` shows alongside `SuperIntelPanel` — double loading states | `App.jsx` render section | Conditionally suppress `ThinkingIndicator` when `mode === 'superintelligence'` |
| B4 | `clearTimeout` on milestone timers only runs on success path, not on error | `App.jsx` `handleSuperIntel` | Move `clearTimeout` calls into a `finally` block |
| B5 | No `AbortController` in `handleSuperIntel` — request cannot be cancelled | `App.jsx` | Wire up `abortRef` the same way `handleStreamChat` does |
| B6 | `SuperIntelPanel` `margin-left: 44px` breaks layout on mobile screens | `SuperIntelPanel.jsx` | Use responsive margin or match the mobile layout offset instead |
| B7 | Step connector fill animation targets `height` but fill div has no `height: 100%` | `SuperIntelPanel.jsx` `StepConnector` | Add explicit `height: '100%'` to the inner fill div |
| B8 | `step3End` timing never saved before panel exits — per-step duration shows null for Judge | `App.jsx` `handleSuperIntel` | Call `setSuperIntelTiming({ step3End: Date.now() })` before `setSuperIntelStep(0)` |
| B9 | DM Sans font not explicitly imported in `index.css` — panel falls back to system font | `frontend/src/index.css` | Add `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap')` |
| B10 | `useChatStore.setState()` called directly in `App.jsx` to attach `superIntelData` — bypasses action layer | `App.jsx`, `chatStore.js` | Add `attachSuperIntelData(data)` action to the store and call that instead |

---

## Priority Implementation Order

If you're deciding what to build next, here's a recommended sequence based on impact vs effort:

**High impact, low effort (build first):**
Feature 18 (Regenerate) → Feature 32 (Keyboard Shortcuts) → Feature 20 (Pin Messages) → Feature 17 (Reactions) → B1–B10 (Bug fixes)

**High impact, medium effort (build second):**
Feature 1 (Confidence Score) → Feature 6 (Memory) → Feature 11 (Citations) → Feature 25 (Token Tracker) → Feature 21 (TTS)

**High impact, high effort (build when ready):**
Feature 7 (Auto Mode) → Feature 12 (Multi-doc RAG) → Feature 15 (Web RAG) → Feature 22 (Image Input) → Feature 29 (Playground)

**Advanced / platform features (long term):**
Feature 33 (Share Link) → Feature 35 (Team Workspaces) → Feature 34 (Blog Export)

---

> **Built with ♥ by Shanmukh Datta**
> *ShanXBot — Think in Parallel. Answer in Perfect.*

# 🧠 Second Brain

Second Brain is an AI-powered personal knowledge system built with Next.js.
It helps you capture notes, organize them intelligently, and retrieve insights using semantic search powered by embeddings and RAG.

Instead of acting like a traditional note-taking app, it behaves more like a thinking partner — capable of understanding context, not just keywords.

## 🌟 Key Features

- **Semantic AI Search**: Ask questions in natural language, and the system synthesizes answers natively from your notes using RAG (Retrieval-Augmented Generation) powered by OpenRouter and `pgvector`.
- **Intelligent Auto-Tagging**: Don't want to categorize? Our autonomous agent intervenes on save, analyzing your content to generate hyper-relevant topic tags automatically.
- **Graph Visualization**: Explore the interconnected relationships between your thoughts via an interactive React Flow node graph.
- **Rich Dashboard**: Chronological tracking, tag-based filtering, and a powerful `Cmd+K` command palette for fast traversals.
- **Headless API**: Exposes a secure, public-facing Global Read Endpoint allowing external widgets and apps to query your knowledge graph.
- **Glassmorphism Aesthetics**: A clean, calming, and progressive UX utilizing smooth scrolling (Lenis) and intelligent layout physics.

---

## 🏗 Architecture

Second Brain thrives on a **Portable Architecture** separating our core concerns:

- **Frontend Layer**: Next.js (App Router), React, Tailwind CSS, Framer Motion.
- **API/Service Layer**: Serverless Edge routes managing API endpoints seamlessly.
- **LLM Engine**: OpenRouter integration (configured natively via OpenAI's SDK) for robust, model-agnostic completions (e.g., GPT-4o, Claude 3).
- **Database Layer**: Supabase providing robust PostgreSQL.
- **Vector Search**: `pgvector` powering embeddings and similarity rankings.

*Nothing is tightly coupled. If OpenRouter experiences downtime, the endpoint natively swaps to standard OpenAI variables. If Supabase alters its framework, the platform can be cleanly migrated to native Postgres containers.*

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- npm or pnpm
- A Supabase Project (with `pgvector` enabled)
- An OpenRouter (or OpenAI) API Key

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/second-brain.git
cd second-brain
npm install
# or
pnpm install
```

### 3. Environment Variables Setup

Create a `.env.local` file in the root of the project. A template has been provided in `.env.example`.

```env
# .env.local

# SUPABASE (Database, Auth, and Storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OPENROUTER (AI Integrations)
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4. Supabase Schema Requirements

Ensure your Supabase PostgreSQL instance has `pgvector` enabled and contains the appropriate tables (`knowledge_items`, `knowledge_links`, `knowledge_attachments`) alongside the RPC function `search_notes` to handle cosine similarity vector queries. 

> *Note: If starting fresh, ensure `RLS` (Row Level Security) is properly bypassed or authenticated via the middleware.*

### 5. Run the Local Development Server

```bash
npm run dev
# or
pnpm dev
```

Your system will boot at `http://localhost:3000`. 

## 🔌 API Endpoints

### Query AI (Protected)
- **POST** `/api/query`
- Validates the active user's session and retrieves contextually relevant notes via RAG.

### Add Knowledge (Protected)
- **POST** `/api/notes`
- Inserts a new thought. If tags are omitted, it triggers the Agent Auto-Tagging loop.

### Public Brain Endpoint (Headless exposure)
- **GET** `/api/public/brain/query?q={query}&userId={uuid}`
- Uses the `SUPABASE_SERVICE_ROLE_KEY` to bypass traditional RLS, allowing integration with external applications (e.g., Discord bots, portfolio widgets).

## 💡 UX Principles

The system is strictly designed with four core tenets:
1. **Intelligence over clutter:** Contextual surfaces over endless data grids.
2. **Calm cognitive environment:** Soft lighting, whitespace, and gentle physics.
3. **Progressive disclosure:** Complex graph maps hide gracefully until requested.
4. **Emotional personalization:** Lasting interactions triggered by subtle hover states.

---
*Developed with Next.js, Framer Motion, and engineered specifically for AI-native workflows.*

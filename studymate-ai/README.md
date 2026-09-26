# 📚 StudyMate AI

> **Your Smart Study Companion** — A complete student productivity platform built for college students.

**AWS Hackathon 2026** | Category: `#daily-life-enhancement` | Lane: `#community`

---

## Overview

StudyMate AI is a fully offline, browser-based student productivity app. It helps college students organise every aspect of their academic life — subjects, assignments, notes, exam schedules, and study sessions — all in one polished dashboard with a built-in AI Study Assistant.

All data is stored locally in the browser using **localStorage**. No server, no database, no login required.

---

## Features

| Feature | Description |
|---------|-------------|
| 🏠 **Dashboard** | Welcome banner, stat cards, today's sessions, upcoming deadlines, exams, recent notes, quick actions |
| 📚 **Subjects** | Add/edit/delete subjects with code, description, instructor, icon, colour, credits, and progress |
| 📝 **Assignments** | Full CRUD with priority, status (Pending / In Progress / Completed), due-date badges, search and filter |
| 🗒️ **Notes** | Rich note cards with tags, subject filter, tag filter, full-text search, and viewer modal |
| 📅 **Exam Schedule** | Countdown rings, urgency bar, venue, past/upcoming tabs, search |
| ⏱️ **Study Planner** | 7-day week strip, topic field, subject filter, mark complete/undo, upcoming sessions preview |
| 📊 **Progress** | SVG donut chart, 7-day activity bar chart, per-subject breakdown, priority stats — all from real data |
| 🤖 **AI Assistant** | Local demo chat with 12+ topic handlers, suggested prompts, copy responses, localStorage persistence |
| ⚙️ **Settings** | Profile, theme toggle, notifications, reset demo data, clear all data |
| 🔍 **Search** | Text search on Assignments, Subjects, Notes, Exams, and within Planner |
| 🌙 **Dark / Light mode** | Full theme system via CSS custom properties |
| 📱 **Responsive** | Desktop sidebar + mobile hamburger menu, all forms usable on small screens |
| 🍞 **Toast notifications** | Success/error/info/warning toasts on every CRUD operation |

---

## Technology

| Tool | Purpose |
|------|---------|
| **React 18** | UI framework |
| **React Router v6** | Client-side routing |
| **Vite 5** | Build tool and dev server |
| **CSS Custom Properties** | Design tokens + dark/light theming |
| **localStorage** | All data persistence (no backend) |
| **crypto.randomUUID()** | Unique IDs without a library |
| **No external UI libraries** | All components built from scratch |
| **No charting libraries** | Progress charts built with pure SVG/CSS |

---

## Local Setup

```bash
# 1. Navigate to the project folder
cd studymate-ai

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Build for production

```bash
npm run build
```

Output goes to `dist/` — ready for static hosting.

---

## Project Structure

```
studymate-ai/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx / .css     ← Fixed sidebar, mobile overlay, nav badges
│   │   │   └── TopNav.jsx  / .css     ← Top bar, page title, name edit, theme toggle
│   │   └── ui/
│   │       ├── Modal.jsx              ← Reusable modal (Escape / overlay close)
│   │       ├── ConfirmDialog.jsx      ← Destructive action confirmation
│   │       ├── EmptyState.jsx         ← Empty state with icon/title/action
│   │       └── ProgressBar.jsx        ← Accessible progress bar
│   ├── context/
│   │   ├── AppContext.jsx             ← All global state + localStorage + CRUD
│   │   └── ToastContext.jsx           ← Toast notification system
│   ├── pages/
│   │   ├── Dashboard.jsx / .css       ← Main overview page
│   │   ├── Subjects.jsx  / .css       ← Subject management + search
│   │   ├── Assignments.jsx / .css     ← Assignment tracking + search/filter
│   │   ├── Notes.jsx     / .css       ← Notes with tags + search
│   │   ├── Exams.jsx     / .css       ← Exam schedule with countdown
│   │   ├── Planner.jsx   / .css       ← Study session planner
│   │   ├── Progress.jsx  / .css       ← Stats and charts
│   │   ├── Assistant.jsx / .css       ← AI chat interface
│   │   ├── Settings.jsx  / .css       ← Profile and data management
│   │   └── NotFound.jsx  / .css       ← 404 page
│   ├── styles/
│   │   └── global.css                 ← Design tokens, reset, shared utilities
│   ├── utils/
│   │   ├── helpers.js                 ← Shared date/format/search helpers
│   │   └── assistantLogic.js          ← AI assistant response engine
│   ├── App.jsx / .css                 ← App shell + all routes
│   └── main.jsx                       ← React entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Data

All data is persisted in **browser localStorage** using structured keys:

| Key | Contents |
|-----|----------|
| `sm_theme` | `'light'` or `'dark'` |
| `sm_studentName` | Your display name |
| `sm_settings` | Email, notification preference |
| `sm_subjects` | Array of subject objects |
| `sm_assignments` | Array of assignment objects |
| `sm_notes` | Array of note objects (with tags) |
| `sm_exams` | Array of exam objects |
| `sm_sessions` | Array of study session objects |
| `sm_chatMessages` | AI chat conversation history |

On first load, the app injects realistic seed data so the dashboard looks populated. All seed data can be edited or deleted normally. Use **Settings → Reset Demo Data** to restore it, or **Settings → Clear All Data** to start fresh.

---

## AI Assistant

The StudyMate AI Assistant is a **local, demo-only implementation**. It uses pre-programmed pattern matching to respond to common study-related questions.

⚠️ **It is not connected to any external AI service** (no OpenAI, no Amazon Bedrock, no API calls). All responses are generated on-device with no data transmitted anywhere.

The assistant can help with:
- Explaining topics (Feynman Technique)
- Creating study plans
- Generating practice quiz questions
- Summarising notes effectively
- Exam preparation guides
- Programming problem frameworks
- Study techniques (Pomodoro, spaced repetition, active recall)
- Subject-specific tips, motivation, and burnout strategies

In a production version, this assistant would be powered by **Amazon Bedrock** (e.g. Claude or Titan) to provide genuinely dynamic, context-aware responses.

---

## Hackathon

**Event:** AWS Hackathon 2026  
**Category:** `#daily-life-enhancement`  
**Lane:** `#community`

StudyMate AI addresses a real daily-life pain point for millions of college students — fragmented tools for managing academic responsibilities. By bringing everything into one offline-first, privacy-respecting app, it demonstrates how technology can meaningfully improve student wellbeing and performance.

---

## AWS Deployment

> 🚧 **Deployment pending — this section will be updated after the hackathon build phase.**

The production deployment will be hosted on AWS using:
- **Amazon S3** — static site hosting for the React build
- **Amazon CloudFront** — CDN with HTTPS
- **Amazon Bedrock** — replacing the local AI assistant with a production LLM

**Live URL:** _(to be added)_

---

## Security

This project contains no passwords, API keys, AWS credentials, tokens, or secrets of any kind. All data lives in the user's own browser. See `.gitignore` for excluded files.

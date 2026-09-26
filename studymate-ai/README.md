# 📚 StudyMate AI

> **Your Personalized AI-Powered Study Companion**
> Helping college students organize learning, understand study materials, practice quizzes, plan study sessions, and track academic progress — all in one place.

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Storage-localStorage-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-On--Device-green?style=for-the-badge" />
</p>

---

## 📖 Project Overview

**StudyMate AI** is a fully offline, browser-based student productivity platform built with React and Vite. It brings together every tool a college student needs for academic success — subject management, assignment tracking, smart notes, exam scheduling, study session planning, and a built-in AI Study Assistant — into a single polished application.

All data is stored locally in the browser using `localStorage`. There is no backend server, no login required, and no data ever leaves the device. The AI assistant runs entirely on pre-programmed local logic, meaning the app works anywhere, anytime, even without an internet connection.

---

## 🚩 Problem Statement

College students juggle multiple subjects, deadlines, exam dates, and revision sessions across a fragmented set of tools — calendars, note apps, spreadsheets, and reminder apps that don't talk to each other. This fragmentation leads to:

- Missed deadlines and forgotten assignments
- Inefficient study sessions without structure or focus
- No visibility into overall academic progress
- Difficulty synthesising study materials into actionable revision plans
- Wasted time switching between disconnected tools

There is no single, lightweight tool that handles the **full student academic workflow** in one place — especially one that works offline and respects student privacy.

---

## 💡 Our Solution

StudyMate AI solves this with a **unified, offline-first academic productivity platform** that:

- Centralises subjects, notes, assignments, exams, and study sessions in one dashboard
- Provides an **on-device AI Study Assistant** that responds to study questions without sending any data externally
- Calculates real progress metrics from actual user data — no hard-coded statistics
- Works on any device, in any browser, with no installation or account required
- Supports both light and dark modes for comfortable use at any time of day

---

## ✨ Key Features

### 🏠 Personalised Dashboard
A live overview of everything that matters. Shows today's study sessions, pending assignments with urgency badges, upcoming exam countdowns, subject progress bars, recent notes, and a quick-action grid for instant navigation to any feature. All values update automatically from stored data.

### 🤖 AI Study Assistant
A conversational chat interface powered entirely by on-device pattern-matching logic. No external API is called — all responses are generated locally. The assistant covers:

| Topic | Example prompts |
|-------|----------------|
| Study plans | "Create a study plan for my subjects" |
| Quiz questions | "Generate quiz questions for calculus" |
| Note summaries | "How do I summarize my notes effectively?" |
| Exam preparation | "Help me prepare for an exam" |
| Programming help | "Explain this programming problem" |
| Explain topics | "Explain a topic in simple words" |
| Study techniques | Pomodoro, spaced repetition, active recall |
| Motivation & wellbeing | Procrastination, stress, burnout |

Chat history is persisted in `localStorage` so conversations survive page refreshes. Typing indicator, message timestamps, copy-response button, and suggested prompts are all included.

### 📚 Study Materials (Subjects)
Full subject management with:
- Subject name, code, instructor, description, credits
- Custom colour and icon picker (15 icons, 10 colours)
- Per-subject statistics: assignments, sessions, hours studied
- Visual progress bar calculated from real activity data
- Text search across name, code, instructor, and description

### 📝 AI-powered Summaries (Notes)
A rich notes system designed around the study workflow:
- Notes with title, subject, content, and comma-separated **tags**
- Full-text search across title, content, and tags
- Filter by subject and by individual tag
- Click-to-open note viewer modal with full content display
- Notes sorted by most recently updated
- Create, edit, delete with toast confirmations

### ❓ Quiz and Practice
The AI assistant generates structured practice questions on demand for Mathematics, Computer Science, Physics, and general subjects. It also teaches students how to write their own effective quiz questions using retrieval-practice techniques. Quiz prompts can be saved directly as Notes for future revision.

### ⏱️ Study Planner
A 7-day sliding calendar planner:
- Add sessions with subject, topic, date, start time, and duration
- Navigate forward and backward through any week
- Mark sessions as complete / undo completion
- Filter sessions by subject within a selected day
- Upcoming sessions preview list
- Total hours studied calculated from completed sessions only

### 📋 Assignments
Complete assignment lifecycle management:
- Fields: title, description, subject, due date, priority, status
- Three statuses: **Pending → In Progress → Completed** (click the status button to cycle)
- Priority levels: Low, Medium, High (colour-coded left stripe on each row)
- Smart due-date badges: overdue, today, due soon, upcoming, completed
- Text search across title, description, and subject name
- Filter by status, priority, and subject; sort by due date, priority, or title

### 📊 Progress Tracking
A dedicated analytics dashboard calculated entirely from real user data:
- Overall completion percentage (assignments + sessions combined)
- SVG donut chart showing overall progress
- 7-day study activity bar chart (hours studied per day)
- Per-subject breakdown with individual progress bars
- Assignment completion by priority (High / Medium / Low)
- Recent completed assignments and recent completed sessions panels

### 📅 Exam Tracking
- Add exams with title, subject, date, time, venue, and description
- Visual countdown rings — colour shifts to yellow (≤7 days) then red (≤3 days)
- Urgency progress bar for exams within 14 days
- Upcoming / Past tab toggle
- Text search across exam title, venue, and description
- Edit any exam detail without losing other data

### 🌙 Light / Dark Mode
Full theme system built with CSS custom properties. Toggle in the top navigation bar or via the Settings page. Preference is persisted to `localStorage` and applied on every reload. All cards, modals, charts, and the chat interface are fully styled for both themes.

---

## 🎓 How StudyMate AI Helps Students

| Student Challenge | StudyMate AI Solution |
|---|---|
| "I forget assignment deadlines" | Dashboard shows upcoming deadlines with overdue highlighting |
| "I don't know how to start studying" | AI assistant gives structured study plans and technique guides |
| "My notes are scattered across apps" | Notes page with subject tagging, full-text search, and tags |
| "I can't track how much I've studied" | Progress page with real charts from actual session data |
| "I panic before exams" | Exam countdown rings + AI-generated preparation guides |
| "I don't know what to focus on" | Subject progress bars show exactly where gaps exist |
| "I waste time on unplanned sessions" | Study Planner with topic-level session scheduling |
| "I need help with a concept right now" | AI assistant available instantly, offline, at any time |

---

## 🛠️ Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| UI Framework | React | 18.2 | Component-based interface |
| Build Tool | Vite | 5.1 | Dev server and production build |
| Routing | React Router DOM | 6.22 | Client-side navigation |
| Styling | CSS Custom Properties | — | Design tokens, light/dark themes |
| State Management | React Context API | built-in | Global app state |
| Persistence | Web localStorage | browser | All data storage |
| AI Engine | Custom pattern-matching | — | On-device assistant logic |
| Charts | Pure SVG + CSS | — | Progress visualisations (no library) |
| IDs | `crypto.randomUUID()` | browser | Unique record identifiers |
| Font | Inter (Google Fonts) | variable | Typography |

**Zero external UI libraries. Zero charting libraries. Zero paid APIs. Zero backend.**

---

## 🏗️ Application Architecture

```
Browser
│
├── React App (SPA — Single Page Application)
│   ├── AppContext          ← Global state + all CRUD operations
│   ├── ToastContext        ← Notification system
│   │
│   ├── Layout
│   │   ├── Sidebar         ← Fixed navigation with live badge counts
│   │   └── TopNav          ← Page title, name editor, theme toggle
│   │
│   ├── Pages (9 routes)
│   │   ├── /               Dashboard
│   │   ├── /subjects        Subject management
│   │   ├── /assignments     Assignment tracking
│   │   ├── /notes           Notes with tags
│   │   ├── /exams           Exam schedule
│   │   ├── /planner         Study session planner
│   │   ├── /progress        Analytics and charts
│   │   ├── /assistant       AI chat interface
│   │   └── /settings        Profile and data management
│   │
│   └── Utilities
│       ├── assistantLogic.js   Pattern-matching AI response engine
│       └── helpers.js          Shared date/format/search helpers
│
└── localStorage
    ├── sm_theme            Light or dark preference
    ├── sm_studentName      Display name
    ├── sm_settings         Email, notification preference
    ├── sm_subjects         Subjects array
    ├── sm_assignments      Assignments array
    ├── sm_notes            Notes array (with tags)
    ├── sm_exams            Exams array
    ├── sm_sessions         Study sessions array
    └── sm_chatMessages     AI chat history
```

### Data Flow

```
User Action → React Component → AppContext (CRUD) → localStorage
                                     ↓
                             State Update → Re-render → UI reflects change
```

All state is managed in `AppContext.jsx` using React's `useState` + a custom `useLocalStorage` hook that synchronises every write to `localStorage` automatically.

---

## 💻 Snapdragon / HP PC Optimization

StudyMate AI is architected from the ground up with **efficient, on-device operation** in mind — making it well-suited for use on Snapdragon-powered HP PCs and other modern ARM-based systems.

### On-Device AI Philosophy

The AI Study Assistant deliberately avoids reliance on external API calls. All responses are generated locally through a pattern-matching engine (`assistantLogic.js`) that:

- Runs entirely in the browser JavaScript engine
- Consumes no network bandwidth after initial page load
- Introduces zero latency from server round-trips
- Works fully offline — ideal for studying anywhere

This "local-first AI" approach aligns with the direction of modern Snapdragon NPU (Neural Processing Unit) hardware, which is designed to accelerate on-device inference workloads efficiently without draining battery on cloud calls.

### Why Snapdragon-Powered HP PCs Are a Good Fit

| Characteristic | Benefit for StudyMate AI |
|---|---|
| ARM-native browser execution | Vite-built React apps are pure JavaScript — no platform-specific binaries needed |
| Efficient power consumption | Long study sessions without battery anxiety |
| Instant wake from sleep | The SPA loads from cache in under 3 seconds — no re-login, no data loss |
| NPU availability | A future version integrating a local LLM (e.g. via WebLLM or WebNN) could leverage the NPU directly for richer AI responses |
| Always-connected capability | When online, future cloud AI features (Amazon Bedrock, Amazon Q) can be added without architectural changes |

> **Note:** The above describes the application's design intent and architectural compatibility. No device-specific benchmarks have been measured or are claimed.

---

## 📦 Installation

### Prerequisites

- **Node.js** v18 or later — [nodejs.org](https://nodejs.org)
- **npm** v9 or later (comes with Node.js)

### Clone and install

```bash
# Clone the repository
git clone https://github.com/your-username/studymate-ai.git

# Enter the project directory
cd studymate-ai

# Install dependencies
npm install
```

---

## 🚀 How to Run Locally

```bash
# Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

The app loads with built-in demo data (subjects, assignments, notes, exams, and study sessions) so the dashboard looks populated immediately. All demo data can be edited or deleted normally.

### Other commands

```bash
# Build for production (outputs to dist/)
npm run build

# Preview the production build locally
npm run preview

# Run ESLint
npm run lint
```

---

## 📁 Project Structure

```
studymate-ai/
│
├── public/
│   └── favicon.svg                  ← App icon
│
├── src/
│   ├── App.jsx                      ← Root component, all routes, app shell
│   ├── App.css                      ← Shell layout styles
│   ├── main.jsx                     ← React entry point + BrowserRouter
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx / .css   ← Fixed sidebar, nav badges, mobile overlay
│   │   │   └── TopNav.jsx  / .css   ← Top bar, page title, name edit, theme toggle
│   │   └── ui/
│   │       ├── Modal.jsx            ← Reusable modal (Escape + overlay close)
│   │       ├── ConfirmDialog.jsx    ← Destructive-action confirmation dialog
│   │       ├── EmptyState.jsx       ← Empty state with icon, title, action
│   │       └── ProgressBar.jsx      ← Accessible progress bar component
│   │
│   ├── context/
│   │   ├── AppContext.jsx           ← All global state, CRUD, localStorage sync
│   │   └── ToastContext.jsx         ← Toast notification provider + Toaster UI
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx / .css     ← Live overview with stats and quick actions
│   │   ├── Subjects.jsx  / .css     ← Subject CRUD + search + progress
│   │   ├── Assignments.jsx / .css   ← Assignment tracking, filters, status cycle
│   │   ├── Notes.jsx     / .css     ← Notes with tags, search, viewer modal
│   │   ├── Exams.css     / .css     ← Exam schedule with countdown rings
│   │   ├── Planner.jsx   / .css     ← 7-day session planner
│   │   ├── Progress.jsx  / .css     ← Analytics — charts, breakdowns, history
│   │   ├── Assistant.jsx / .css     ← AI chat interface
│   │   ├── Settings.jsx  / .css     ← Profile, theme, data management
│   │   └── NotFound.jsx  / .css     ← 404 page
│   │
│   ├── styles/
│   │   └── global.css               ← Design tokens, CSS variables, shared utilities
│   │
│   └── utils/
│       ├── assistantLogic.js        ← AI response engine: topics, patterns, responses
│       └── helpers.js               ← Shared: daysUntil, formatDate, matchSearch, etc.
│
├── index.html                        ← Vite HTML entry (Inter font link)
├── vite.config.js                    ← Vite configuration
├── package.json                      ← Dependencies and scripts
├── .eslintrc.cjs                     ← ESLint configuration
├── .gitignore                        ← Excludes node_modules, dist, .env, credentials
└── README.md                         ← This file
```

---

## 📸 Screenshots

> Add screenshots of the running application here.

| Page | Description |
|------|-------------|
| `dashboard.png` | Main dashboard with stats, sessions, and quick actions |
| `assistant.png` | AI chat interface with suggested prompts |
| `subjects.png` | Subject cards with progress bars |
| `assignments.png` | Assignment list with priority stripes and status badges |
| `notes.png` | Note cards with tag chips and search toolbar |
| `exams.png` | Exam countdown rings with urgency bar |
| `planner.png` | 7-day week strip and daily session list |
| `progress.png` | Donut chart and 7-day activity bar chart |
| `settings.png` | Profile, theme toggle, and data management |
| `dark-mode.png` | Any page in dark mode |

*To add screenshots: create a `screenshots/` folder in the repo root, add the images, and replace the table above with `![Dashboard](screenshots/dashboard.png)` etc.*

---

## 🔮 Future Enhancements

The current version is a fully functional local-first application. Planned future enhancements include:

| Enhancement | Description |
|---|---|
| 🧠 **Real AI integration** | Replace pattern-matching with Amazon Bedrock (Claude / Titan) for genuinely dynamic, context-aware responses |
| 🌐 **Cloud sync** | Optional AWS Amplify backend so data syncs across devices |
| 📄 **Note import** | Upload PDFs or text files and have the AI assistant summarise them |
| 🃏 **Flashcard mode** | Auto-generate spaced-repetition flashcards from notes |
| 📱 **PWA support** | Install as a Progressive Web App for a native-like mobile experience |
| 🔔 **Push notifications** | Deadline and exam reminders via the Web Notifications API |
| 📊 **Richer analytics** | Weekly study trends, streak tracking, subject performance over time |
| 👥 **Study groups** | Shared notes and collaborative session planning |
| 🏆 **Gamification** | Study streaks, achievement badges, and milestone celebrations |
| 🌍 **Multi-language** | Interface localisation for non-English-speaking students |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request describing your changes

Please keep PRs focused on a single feature or fix. Follow the existing code style (ES modules, React functional components, CSS custom properties).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🏆 Hackathon Details

| Field | Value |
|---|---|
| **Project** | StudyMate AI |
| **Category** | `#daily-life-enhancement` |
| **Lane** | `#community` |
| **Stack** | React 18 · Vite 5 · Vanilla CSS · localStorage |
| **AI approach** | On-device local logic (production path: Amazon Bedrock) |
| **Offline-first** | ✅ Works with zero internet after first load |
| **No paid APIs** | ✅ |
| **No backend required** | ✅ |

---

<p align="center">
  Made with ❤️ for students, by students.<br/>
  <strong>StudyMate AI — Study smarter, not harder.</strong>
</p>

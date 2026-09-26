/**
 * StudyMate AI — Local assistant logic
 * Responds to common study questions using pattern matching + context data.
 * No external API required. Clearly labelled as a local/demo assistant.
 */

// Typing delay simulation (ms base, extra added per message length)
export const TYPING_DELAY = 500

// localStorage key for persisted chat history
export const CHAT_STORAGE_KEY = 'sm_chatMessages'

// ---- Response database ----
const TOPICS = [
  // ── NEW: Explain a topic ──────────────────────────────────────────────
  {
    patterns: [/explain.{0,20}(topic|concept|term|idea|subject)/i, /what (is|are|does)/i, /explain.{0,15}simple/i, /in simple words/i, /explain this/i],
    responses: [
      `**How to explain any topic in simple words:**\n\nUse the **Feynman Technique** — one of the most powerful learning methods:\n\n1. **Choose your topic** — Pick one concept (e.g. "Newton's Second Law")\n2. **Write it as if teaching a child** — Use plain language, no jargon\n3. **Identify your gaps** — Where did you get stuck or use a word you can't explain?\n4. **Go back and re-learn** — Fill those gaps with your source material\n5. **Simplify and use analogies** — "Force is like pushing a shopping cart — more mass means you need more push"\n\nIf you want me to explain a specific topic, just type it out! For example:\n- *"Explain photosynthesis in simple words"*\n- *"What is a binary search tree?"*\n- *"Explain Newton's laws simply"*\n\nI'll do my best to break it down for you. 🎓`,
    ],
  },

  // ── NEW: Create a study plan ──────────────────────────────────────────
  {
    patterns: [/study.{0,10}plan/i, /create.{0,15}plan/i, /plan.{0,15}study/i, /schedule.{0,15}study/i, /how.{0,10}organis/i, /how.{0,10}organiz/i],
    responses: [
      `**Here's how to build an effective study plan:**\n\n**Step 1 — Take stock**\n- List all your subjects and upcoming exam/assignment dates\n- Estimate how many hours each topic needs\n\n**Step 2 — Set a weekly schedule**\n- Block fixed study slots (treat them like classes)\n- Study your hardest subjects when your energy is highest\n- Mix subjects to avoid fatigue\n\n**Step 3 — Apply the 50/10 rule**\n- 50 minutes of focused study → 10 minute break\n- No phones during the 50 minutes\n\n**Step 4 — Review daily**\n- Spend the last 10 minutes reviewing what you covered\n- This alone doubles retention\n\n**Step 5 — Track and adjust**\n- Mark sessions done in the **Study Planner** page\n- Adjust the plan weekly based on progress\n\n💡 *Pro tip:* Use the **Exam Schedule** page to add your deadlines, then work backwards in the **Study Planner** to create a realistic timeline. 📅`,
    ],
  },

  // ── NEW: Generate quiz questions ──────────────────────────────────────
  {
    patterns: [/quiz.{0,15}question/i, /generate.{0,15}quiz/i, /test.{0,15}myself/i, /practice.{0,15}question/i, /make.{0,15}question/i, /create.{0,15}quiz/i],
    responses: [
      `**Generating Quiz Questions — Strategies & Samples:**\n\nI can't dynamically generate questions from your specific notes yet, but here's how to create great quiz questions yourself — plus sample questions across common subjects:\n\n**How to write your own quiz questions:**\n1. Read a section of your notes\n2. Close the notes\n3. Write "What, How, Why, When, Explain" questions from memory\n4. Answer them — then check\n\n**Sample questions by subject:**\n\n🧮 **Math / Calculus:**\n- What is the derivative of sin(x)?\n- State the Fundamental Theorem of Calculus\n- Solve: ∫ 2x dx\n\n💻 **Computer Science:**\n- What is the time complexity of binary search?\n- Explain the difference between a stack and a queue\n- What does O(n log n) mean?\n\n⚛️ **Physics:**\n- State Newton's three laws of motion\n- What is the formula for kinetic energy?\n- Explain the photoelectric effect\n\n📝 **General study:**\n- What are the key points from today's lecture?\n- How does [concept A] relate to [concept B]?\n- What would happen if [key variable] changed?\n\n💡 Tip: Save your quiz questions as a **Note** in the Notes page so you can review them later! 🗒️`,
    ],
  },

  // ── NEW: Summarize notes ──────────────────────────────────────────────
  {
    patterns: [/summari[sz]e.{0,20}note/i, /note.{0,10}summary/i, /condense.{0,15}note/i, /key.{0,10}point/i, /main.{0,10}point/i],
    responses: [
      `**How to Summarize Your Notes Effectively:**\n\nI can't read your notes directly yet, but here's the most effective summarization method:\n\n**The 3-Pass Technique:**\n\n📖 **Pass 1 — Skim (2 min)**\n- Read headings and first sentences only\n- Get the overall structure in your head\n\n📖 **Pass 2 — Read actively (full time)**\n- Underline only the most essential sentences\n- Write a one-line summary per paragraph in the margin\n\n📖 **Pass 3 — Compress (5 min)**\n- Without looking at the notes, write a 5-sentence summary\n- Include: main idea, 3 supporting points, 1 conclusion\n\n**Cornell Note Summary Structure:**\n| Section | Content |\n|---------|----------|\n| **Topic** | One-line title |\n| **Key facts** | Bullet points, max 5 |\n| **Formulas/dates** | Only the critical ones |\n| **So what?** | Why does this matter? |\n| **Review question** | One question to test yourself |\n\n💡 *Tip:* After summarizing, save the compressed version as a new **Note** in StudyMate — this becomes your revision card before the exam! 📝`,
    ],
  },

  // ── NEW: Help prepare for exam ────────────────────────────────────────
  {
    patterns: [/help.{0,20}(prepare|prep).{0,20}exam/i, /prepare.{0,10}for.{0,10}(exam|test)/i, /help.{0,15}exam/i, /ready.{0,10}for.{0,10}exam/i, /exam.{0,10}ready/i],
    responses: [
      `**Complete Exam Preparation Guide:**\n\n⏳ **4+ weeks out — Foundation**\n- Attend all classes and keep notes current\n- Review notes within 24h of each lecture\n- Add the exam to your **Exam Schedule** page now\n\n📅 **2 weeks out — Consolidation**\n- Make a topic checklist (everything that could be tested)\n- Identify your weak areas — focus 70% of time there\n- Start doing past papers or practice questions\n- Create a daily study block in the **Study Planner**\n\n⚡ **1 week out — Intensification**\n- Work through practice problems under timed conditions\n- Review all your summary notes\n- Form or join a study group for discussion\n- Avoid learning completely new material now\n\n🔥 **3 days out — Refinement**\n- Focus only on weak areas and key formulas\n- Do one full mock exam / practice test\n- Prepare your exam kit (pens, ID, calculator)\n\n😴 **Night before**\n- Light review only — max 1 hour\n- No new material\n- Sleep 8 hours minimum — this is non-negotiable\n\n🌅 **Day of exam**\n- Eat a proper breakfast (glucose = brain fuel)\n- Arrive 15 minutes early\n- Read the entire paper before starting\n- Attempt every question — partial marks count\n\nGood luck — you've got this! 💪`,
    ],
  },

  // ── NEW: Explain a programming problem ───────────────────────────────
  {
    patterns: [/explain.{0,20}programming/i, /explain.{0,20}(code|algorithm|function|loop|recursion|array|linked list|binary tree|sorting|searching)/i, /programming.{0,15}problem/i, /how.{0,15}(recursion|algorithm|pointer|stack|queue|heap|hash|graph|tree).{0,10}work/i],
    responses: [
      `**Programming Problem Walkthrough — Framework:**\n\nWhen faced with any programming problem, use this structured approach:\n\n**1. Understand the problem** 📋\n- What are the inputs? What are the expected outputs?\n- What are the constraints? (time, memory, edge cases)\n- Restate it in your own words\n\n**2. Plan before you code** 🗺️\n- Identify the data structure needed (array, tree, hash map…)\n- Identify the algorithm pattern:\n  - Sorting → use merge sort / quicksort\n  - Searching → binary search\n  - Optimization → dynamic programming / greedy\n  - Graph problems → BFS / DFS\n  - Recursion → define base case + recursive case\n\n**3. Write pseudocode first** ✍️\n- No syntax, just logic\n- Then translate to actual code\n\n**4. Test with examples** 🧪\n- Test the happy path\n- Test edge cases: empty input, single element, maximum size\n\n**5. Analyse complexity** ⚡\n- Time complexity: how does runtime grow with input size?\n- Space complexity: how much memory does it use?\n\n**Common patterns reminder:**\n| Pattern | When to use |\n|---------|-------------|\n| Two pointers | Sorted arrays, palindromes |\n| Sliding window | Subarray/substring problems |\n| DFS/BFS | Tree or graph traversal |\n| DP | Overlapping subproblems |\n| Divide & conquer | Merge sort, binary search |\n\nIf you share the specific problem, I'll walk through it with you! 💻`,
    ],
  },

  // ── Existing topics (unchanged) ───────────────────────────────────────
  {
    patterns: [/pomodoro/i, /focus.{0,10}technique/i, /time.{0,10}manag/i],
    responses: [
      `**The Pomodoro Technique** is one of the most effective focus methods:\n\n1. Choose a task to work on\n2. Set a timer for **25 minutes** and work with full focus\n3. Take a **5-minute break**\n4. After 4 pomodoros, take a longer **15–30 min break**\n\nThis works because our brains focus better in short bursts. Try it with your next study session in the Planner! 🍅`,
    ],
  },
  {
    patterns: [/spaced.{0,10}repetition/i, /flash.?card/i, /memoriz/i, /remember/i],
    responses: [
      `**Spaced Repetition** is the gold standard for memory:\n\n- Review new material **1 day** after learning\n- Then again after **3 days**, **1 week**, **2 weeks**, and **1 month**\n- Each review strengthens the memory trace\n\nTools like Anki use this automatically. For notes in StudyMate, try tagging notes you need to review and revisiting them on a schedule. 🧠`,
    ],
  },
  {
    patterns: [/active.{0,10}recall/i, /retrieval.{0,10}practice/i, /self.{0,10}test/i, /quiz yourself/i],
    responses: [
      `**Active Recall** beats passive re-reading every time:\n\n✅ Close your notes and try to recall key points\n✅ Write down everything you remember, then check\n✅ Use the Cornell Note method — cover the right column, recite from cues\n✅ Teach the concept to an imaginary student (Feynman Technique)\n\nPassive highlighting gives a false sense of learning. Active testing reveals real gaps. 💡`,
    ],
  },
  {
    patterns: [/note.{0,10}taking/i, /how.{0,8}take.{0,8}note/i, /cornell/i],
    responses: [
      `Here are the **top note-taking strategies** for college:\n\n**Cornell Method** — Divide pages into cue column (left), notes (right), summary (bottom). Great for lectures.\n\n**Mind Maps** — Visual diagrams connecting main ideas. Great for complex subjects.\n\n**Outline Method** — Hierarchical bullet points. Great for structured content like textbooks.\n\n**Charting** — Tables comparing multiple items. Great for science/history.\n\nWhatever method you choose, always review within 24 hours! 📝`,
    ],
  },
  {
    patterns: [/exam.{0,10}prep/i, /study.{0,10}exam/i, /how.{0,10}study/i],
    responses: [
      `**Exam Preparation Strategy:**\n\n📅 **2 weeks before:** Map all topics, identify gaps, create a study schedule\n📅 **1 week before:** Work through practice problems and past papers\n📅 **3 days before:** Focus on weak areas and do full practice tests\n📅 **Day before:** Light review only — no new material. Sleep 8 hours.\n📅 **Day of:** Eat breakfast, arrive early, read instructions carefully\n\nUse the **Exam Schedule** page to set your exam date and the **Study Planner** to block study sessions. 🎯`,
    ],
  },
  {
    patterns: [/procrastinat/i, /can't.{0,10}start/i, /motivat/i, /lazy/i, /distract/i],
    responses: [
      `**Beating Procrastination:**\n\n🔑 **The 2-Minute Rule** — If it takes less than 2 minutes, do it now\n🔑 **Eat the Frog** — Do your hardest task first thing\n🔑 **Environment design** — Put your phone in another room, use a website blocker\n🔑 **Implementation intention** — "I will study at 4pm at the library" is 2–3× more effective than "I'll study today"\n🔑 **Self-compassion** — Don't spiral into guilt; just restart\n\nTry adding your session to the **Study Planner** right now. 💪`,
    ],
  },
  {
    patterns: [/math/i, /calculus/i, /algebra/i, /equation/i, /formula/i],
    responses: [
      `**Tips for mastering Math:**\n\n1. **Understand, don't memorize** — Know why each formula works\n2. **Practice daily** — Even 20 minutes a day beats 3-hour cram sessions\n3. **Work backwards** — Start from the solution on hard problems to understand the reasoning\n4. **Build on basics** — Find and fill foundational gaps (e.g., weak algebra hurts calculus)\n5. **Write out all steps** — Skipping steps is where mistakes hide\n\nAdd your Math subject in **Subjects** and track assignments there! 📐`,
    ],
  },
  {
    patterns: [/programming/i, /coding/i, /computer science/i, /debug/i, /\bcode\b/i],
    responses: [
      `**Learning to Code Effectively:**\n\n💻 **Build projects** — Theory alone doesn't stick; you need to apply it\n💻 **Read others' code** — Open-source projects are free textbooks\n💻 **Rubber duck debugging** — Explain the problem out loud to find the bug\n💻 **Break it down** — Decompose problems into smaller sub-problems\n💻 **Consistent practice** — 1 hour daily > 7 hours on Saturday\n\nTrack your CS assignments in the **Assignments** page and note key concepts in **Notes**! 🚀`,
    ],
  },
  {
    patterns: [/stress/i, /anxiet/i, /overwhelm/i, /burn.?out/i, /tired/i],
    responses: [
      `It sounds like things feel heavy right now. Here are evidence-based strategies:\n\n🌿 **Physical:** Regular sleep (7–9h), daily exercise (even a 20-min walk), proper meals\n🌿 **Mental:** Break work into small chunks, celebrate small wins, set boundaries on screen time\n🌿 **Social:** Talk to a friend, professor, or counselor — don't go it alone\n🌿 **Academic:** Visit office hours, ask for extensions when needed, prioritise tasks\n\nYou can't pour from an empty cup. Taking care of yourself *is* part of the strategy. 💚`,
    ],
  },
  {
    patterns: [/sleep/i, /\brest\b/i, /\bnap\b/i],
    responses: [
      `**Sleep is non-negotiable for learning:**\n\n🛌 Your brain consolidates memories during deep sleep — skimping on sleep literally erases what you studied\n🛌 Aim for **7–9 hours** consistently (same bedtime helps)\n🛌 Avoid screens for 30 min before bed\n🛌 A **20-minute nap** can restore focus without grogginess\n🛌 Prioritise sleep the night before an exam over late cramming. 💤`,
    ],
  },
  {
    patterns: [/essay/i, /thesis/i, /research.{0,10}paper/i],
    responses: [
      `**Essay Writing Framework:**\n\n📝 **Before you write:**\n- Understand the prompt exactly\n- Brainstorm, then outline (intro → 3 body paragraphs → conclusion)\n- Gather sources early\n\n📝 **Drafting:**\n- Write the body first, intro last\n- Each paragraph = one idea + evidence + analysis\n- Don't self-edit while drafting\n\n📝 **Revising:**\n- Read aloud to catch awkward phrasing\n- Check argument flow, not just grammar\n- Leave a day between drafting and editing\n\nSave your outline as a **Note** in StudyMate! 📖`,
    ],
  },
  {
    patterns: [/gpa/i, /grade/i, /\bfail\b/i, /\bpass\b/i, /\bscore\b/i],
    responses: [
      `**Improving Your Grades:**\n\n🎯 **Attend every class** — Simply showing up is the highest-return action\n🎯 **Participate** — Professors remember engaged students\n🎯 **Start assignments early** — Quality drops sharply in the last 2 hours before a deadline\n🎯 **Visit office hours** — Most professors *want* to help\n🎯 **Form study groups** — Explaining to peers deepens your own understanding\n🎯 **Review feedback** — Re-read graded work to understand mistakes\n\nTrack all assignments in the **Assignments** page so nothing slips! ✅`,
    ],
  },
  {
    patterns: [/^(hi|hello|hey|howdy|hiya|greetings)/i, /how are you/i, /what'?s up/i],
    responses: [
      `Hello! 👋 I'm your StudyMate AI Assistant — ready to help you study smarter.\n\nYou can ask me about:\n- Study techniques (Pomodoro, spaced repetition, active recall)\n- Exam preparation strategies\n- Note-taking and summarising methods\n- Creating study plans and quiz questions\n- Managing stress and motivation\n- Programming and subject-specific tips\n\nWhat's on your mind?`,
    ],
  },
  {
    patterns: [/thank/i, /helpful/i],
    responses: [
      `You're very welcome! 😊 Keep up the great work — consistent effort beats last-minute cramming every time. Anything else I can help with?`,
      `Happy to help! 🎓 I'm always here whenever you need study tips or strategies.`,
    ],
  },
  {
    patterns: [/who are you/i, /what.{0,10}(can you|you) do/i, /your (capabilities|features|abilities)/i],
    responses: [
      `I'm the **StudyMate AI Assistant** — a built-in local assistant designed for college students. 🤖\n\n⚠️ **Heads up:** I use pre-programmed local responses — I'm not connected to an external AI service like ChatGPT. Think of me as a smart study guide always available offline.\n\n**What I can help with:**\n- 📚 Study strategies (Pomodoro, spaced repetition, active recall)\n- 🎯 Exam preparation guides\n- 📝 Note-taking, essay writing, and summarisation tips\n- 📅 Building a personalised study plan\n- ❓ Generating practice quiz questions\n- 💻 Programming problem-solving frameworks\n- 💪 Motivation, stress management, and burnout recovery\n- 🔢 Subject tips (Math, CS, Physics, and more)\n\nJust type a question or tap one of the suggested prompts below!`,
    ],
  },
]

const FALLBACK_RESPONSES = [
  `That's an interesting question! While my local knowledge base doesn't cover every topic, here's what I *can* help with:\n\n- 📅 **Study plans** — *"Create a study plan for my exams"*\n- ❓ **Quiz questions** — *"Generate quiz questions for calculus"*\n- 📝 **Note summaries** — *"How do I summarize my notes?"*\n- 🎯 **Exam prep** — *"Help me prepare for an exam"*\n- 💻 **Programming** — *"Explain this programming problem"*\n- 🧠 **Study techniques** — *"What is spaced repetition?"*\n\nTry rephrasing your question or pick one of the suggested prompts below! 👇`,
  `I'm not sure about that specific topic yet — my responses are built in locally without an external AI connection.\n\nHere's what works well:\n\n📖 Study techniques · 🎯 Exam prep · 📅 Study planning\n💻 Programming help · 📝 Writing tips · 💪 Motivation\n\nWhat study challenge can I help you tackle today?`,
]

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getAssistantResponse(userMessage, context) {
  const msg = userMessage.trim()
  if (!msg) return null

  // ── Context-aware responses (reads real user data) ──────────────────
  if (/my (subjects|courses)/i.test(msg) && context?.subjects?.length) {
    const list = context.subjects.map(s => `${s.icon} **${s.name}**`).join(', ')
    return `You're currently enrolled in **${context.subjects.length}** subject(s): ${list}.\n\nWould you like study tips or a study plan for any of these?`
  }

  if (/my (assignments|homework|tasks)/i.test(msg)) {
    const pending = context?.assignments?.filter(a => a.status === 'pending') || []
    if (pending.length === 0) return `🎉 Great news — you have no pending assignments right now! Time to get ahead or review old material using spaced repetition.`
    const sorted = [...pending].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4)
    const sample = sorted.map(a => `• **${a.title}** — due ${a.dueDate}`).join('\n')
    return `You have **${pending.length}** pending assignment(s). The next ones due:\n\n${sample}\n\nWould you like tips on tackling them efficiently?`
  }

  if (/my (exams|upcoming exams)/i.test(msg)) {
    const today = new Date().toISOString().split('T')[0]
    const upcoming = context?.exams?.filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date)) || []
    if (upcoming.length === 0) return `You have no upcoming exams scheduled. Use the **Exam Schedule** page to add them and start the countdown! ⏱️`
    const next = upcoming[0]
    const sub = context?.subjects?.find(s => s.id === next.subjectId)
    const diff = Math.max(0, Math.round((new Date(next.date + 'T00:00:00') - new Date()) / 86400000))
    return `Your next exam is **${next.title || sub?.name || 'Unknown'}** in **${diff} day(s)**${sub ? ` (${sub.name})` : ''}.\n\nYou have ${upcoming.length} total upcoming exam(s). Would you like a full exam preparation guide?`
  }

  // ── Topic pattern matching ──────────────────────────────────────────
  for (const topic of TOPICS) {
    if (topic.patterns.some(p => p.test(msg))) {
      return pickRandom(topic.responses)
    }
  }

  return pickRandom(FALLBACK_RESPONSES)
}

// The 6 required hackathon-featured suggested prompts + 4 extras
export const SUGGESTED_PROMPTS = [
  { label: 'Explain a topic simply',           text: 'Explain a topic in simple words',         icon: '💡' },
  { label: 'Create a study plan',              text: 'Create a study plan for my subjects',      icon: '📅' },
  { label: 'Generate quiz questions',          text: 'Generate quiz questions for my subjects',  icon: '❓' },
  { label: 'Summarize my notes',               text: 'Summarize my notes effectively',           icon: '📝' },
  { label: 'Prepare for an exam',              text: 'Help me prepare for an exam',              icon: '🎯' },
  { label: 'Explain a programming problem',    text: 'Explain this programming problem',         icon: '💻' },
  { label: 'My upcoming assignments',          text: 'What are my upcoming assignments?',        icon: '✅' },
  { label: 'Beat procrastination',             text: 'How to avoid procrastination?',            icon: '🔑' },
]

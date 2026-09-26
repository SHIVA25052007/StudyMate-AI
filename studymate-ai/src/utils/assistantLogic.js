/*
 * StudyMate AI - Local assistant logic
 * Responds to common study questions using pattern matching + context data.
 * No external API required. Clearly labelled as a local/demo assistant.
 */

// Typing delay simulation (ms base, extra added per message length)
export const TYPING_DELAY = 500

// localStorage key for persisted chat history
export const CHAT_STORAGE_KEY = 'sm_chatMessages'

// ---- Direct topic knowledge base ----
// Each entry: regex to detect the topic name, and a direct explanation response.
// Checked BEFORE the generic TOPICS loop so specific "explain X" queries are answered directly.
const TOPIC_EXPLANATIONS = [
  // ── Computer Science / Databases ─────────────────────────────────────────
  {
    detect: /\b(dbms|database management system)\b/i,
    response: `**DBMS - Database Management System** 🗄️\n\n**What is it?**\nA DBMS is software that lets you store, organise, update, and retrieve data in a structured way. Think of it as a very powerful filing cabinet with a built-in assistant that finds and manages your files instantly.\n\n**Key points:**\n- Stores large amounts of data in organised tables (rows and columns)\n- Allows multiple users to access data at the same time safely\n- Uses a query language (SQL) to ask questions like "Find all students with marks above 80"\n- Prevents data duplication and keeps data consistent\n- Handles data security — controls who can see or edit what\n\n**Simple example:**\nA college uses a DBMS to store student names, marks, courses, and attendance. When a teacher wants the list of students who failed, they run one query and get the answer instantly — no manual searching through files.\n\n**Common DBMS software:**\n- MySQL, PostgreSQL, Oracle, Microsoft SQL Server, SQLite\n\n💡 *Tip:* Save these notes in your **Notes** page for quick exam revision!`,
  },
  {
    detect: /\b(sql|structured query language)\b/i,
    response: `**SQL - Structured Query Language** 💾\n\n**What is it?**\nSQL is the language used to communicate with a database. Just like you speak English to a person, you use SQL to talk to a database.\n\n**Key operations (CRUD):**\n- **CREATE / INSERT** - Add new data\n- **SELECT** - Read / retrieve data\n- **UPDATE** - Modify existing data\n- **DELETE** - Remove data\n\n**Simple example:**\n\`\`\`\nSELECT name, marks FROM students WHERE marks > 80;\n\`\`\`\nThis says: "Show me the name and marks of every student who scored above 80."\n\n**Why it matters:**\nSQL is used in almost every app that stores data — social media, banking, shopping sites, school portals. It's one of the most in-demand skills for developers.\n\n💡 *Tip:* Practice SQL with free tools like DB Fiddle or SQLiteOnline.`,
  },
  {
    detect: /\b(oop|object.{0,5}oriented programming|object oriented)\b/i,
    response: `**OOP - Object-Oriented Programming** 🧱\n\n**What is it?**\nOOP is a way of writing programs by grouping related data and actions together into "objects" — just like real-world things.\n\n**The 4 pillars:**\n1. **Encapsulation** - Bundle data and methods together; hide internal details\n2. **Inheritance** - A new class can reuse properties of an existing class (like a child inheriting traits from a parent)\n3. **Polymorphism** - The same action works differently depending on the object (e.g. both Dog and Cat have a "speak" method, but Dog barks and Cat meows)\n4. **Abstraction** - Show only the necessary details; hide the complexity\n\n**Simple example:**\nA "Car" object has:\n- **Properties (data):** colour, speed, fuel\n- **Methods (actions):** accelerate(), brake(), refuel()\n\nInstead of writing separate code for every car, you define one Car class and create as many car objects as you need.\n\n**Languages that use OOP:** Java, Python, C++, C#, JavaScript\n\n💡 *Tip:* OOP is a common exam topic — add these 4 pillars to your **Notes** page!`,
  },
  {
    detect: /\b(os|operating system)\b/i,
    response: `**Operating System (OS)** 💻\n\n**What is it?**\nAn Operating System is the main software that manages a computer's hardware and provides services for application programs. It acts as a bridge between the user and the computer hardware.\n\n**What an OS does:**\n- **Process Management** - Runs multiple programs at once and switches between them\n- **Memory Management** - Allocates RAM to programs and frees it when done\n- **File Management** - Organises files and folders on storage devices\n- **Device Management** - Controls input/output devices (keyboard, screen, printer)\n- **Security** - Manages user accounts and permissions\n\n**Simple example:**\nWhen you open Chrome and Spotify at the same time, the OS decides how much CPU and RAM each gets, makes sure they don't interfere, and switches between them so fast it feels simultaneous.\n\n**Common operating systems:**\n- Windows, macOS, Linux, Android, iOS\n\n💡 *Tip:* Process scheduling and memory management are frequently tested OS exam topics!`,
  },
  {
    detect: /\b(cpu|central processing unit|processor)\b/i,
    response: `**CPU - Central Processing Unit** ⚙️\n\n**What is it?**\nThe CPU is the "brain" of a computer. It carries out instructions from programs by performing calculations and making decisions.\n\n**Key components:**\n- **ALU (Arithmetic Logic Unit)** - Does maths (+, -, *, /) and comparisons\n- **Control Unit** - Fetches and decodes instructions, directs other components\n- **Registers** - Tiny, ultra-fast storage inside the CPU for current data\n- **Cache** - Small fast memory that stores frequently used data\n\n**How it works (Fetch-Decode-Execute cycle):**\n1. **Fetch** - Get the next instruction from memory\n2. **Decode** - Figure out what the instruction means\n3. **Execute** - Carry out the instruction\n\n**Simple example:**\nWhen you press 2 + 3 on a calculator, the CPU fetches the numbers, decodes the + operation, executes the addition, and sends 5 to the display — billions of times per second.\n\n**Speed is measured in:** GHz (gigahertz — billions of cycles per second)`,
  },
  {
    detect: /\b(network|networking|computer network)\b/i,
    response: `**Computer Networks** 🌐\n\n**What is it?**\nA computer network is a group of computers and devices connected together to share data and resources.\n\n**Types of networks:**\n- **LAN (Local Area Network)** - Small area, e.g. computers in a school lab\n- **WAN (Wide Area Network)** - Large area, e.g. the internet\n- **MAN (Metropolitan Area Network)** - City-wide, e.g. a city's CCTV network\n\n**Key concepts:**\n- **IP Address** - Unique ID for every device on a network (like a home address)\n- **Protocol** - Rules for how data is sent (e.g. HTTP, TCP/IP)\n- **Router** - Directs data packets between networks\n- **Server / Client** - Server provides resources; client requests them\n\n**Simple example:**\nWhen you load a website, your computer (client) sends a request to a web server. The request travels through routers across the internet using TCP/IP protocol, and the server sends back the webpage.\n\n💡 *Tip:* The OSI Model (7 layers) is a classic exam question in networking!`,
  },
  {
    detect: /\b(data structure|data structures)\b/i,
    response: `**Data Structures** 📦\n\n**What is it?**\nA data structure is a way of organising and storing data in a computer so it can be accessed and modified efficiently.\n\n**Common data structures:**\n\n- **Array** - A list of items stored in order. Fast to access by index.\n  *Example: storing 5 student marks: [72, 85, 90, 68, 78]*\n\n- **Linked List** - Items stored in nodes, each pointing to the next. Easy to insert/delete.\n\n- **Stack** - Last In, First Out (LIFO). Like a stack of plates.\n  *Example: browser back button history*\n\n- **Queue** - First In, First Out (FIFO). Like a queue at a shop.\n  *Example: print job queue*\n\n- **Tree** - Hierarchical structure with a root and branches.\n  *Example: folder structure on your computer*\n\n- **Hash Table** - Key-value pairs for very fast lookup.\n  *Example: a dictionary / phone contacts*\n\n**Why they matter:** Choosing the right data structure makes programs faster and more memory-efficient.\n\n💡 *Tip:* Arrays, Linked Lists, Stacks, and Queues are the most common exam topics!`,
  },
  {
    detect: /\b(algorithm|algorithms)\b/i,
    response: `**Algorithms** 🔢\n\n**What is it?**\nAn algorithm is a step-by-step set of instructions to solve a problem or complete a task — like a recipe for a computer.\n\n**Key properties of a good algorithm:**\n- **Clear** - Every step is unambiguous\n- **Finite** - It ends after a certain number of steps\n- **Correct** - Produces the right output for any valid input\n- **Efficient** - Uses as little time and memory as possible\n\n**Common algorithm types:**\n\n- **Sorting** - Arranging data in order (Bubble Sort, Merge Sort, Quick Sort)\n- **Searching** - Finding data (Linear Search, Binary Search)\n- **Recursion** - A function that calls itself to solve smaller sub-problems\n- **Dynamic Programming** - Solving complex problems by breaking them into overlapping sub-problems\n\n**Simple example:**\nBinary Search algorithm: to find 50 in a sorted list of 1-100, always check the middle (50). If it matches, done. If your target is higher, search the upper half. This finds any number in just 7 steps instead of 100.\n\n**Algorithm efficiency** is measured using **Big O notation** — O(n), O(log n), O(n²), etc.`,
  },
  {
    detect: /\b(recursion|recursive)\b/i,
    response: `**Recursion** 🔄\n\n**What is it?**\nRecursion is when a function calls itself to solve a smaller version of the same problem, until it reaches a simple "base case" it can solve directly.\n\n**Two essential parts:**\n1. **Base case** - The condition where the function stops calling itself\n2. **Recursive case** - The function calls itself with a smaller input\n\n**Simple example - Factorial:**\nFactorial of 4 = 4 × 3 × 2 × 1 = 24\n\nWith recursion:\n- factorial(4) = 4 × factorial(3)\n- factorial(3) = 3 × factorial(2)\n- factorial(2) = 2 × factorial(1)\n- factorial(1) = 1 ← base case, stop here!\n\n**Mental model:** Think of a mirror facing a mirror — each reflection is a smaller copy of the same image, until the reflections become too small to see (base case).\n\n**When to use recursion:**\n- Tree traversal\n- Divide and conquer (Merge Sort, Quick Sort)\n- Solving mazes, puzzles\n- Any problem that naturally breaks into smaller identical sub-problems\n\n⚠️ *Always define a base case, or the function will loop forever (stack overflow)!*`,
  },
  // ── Science / Physics ────────────────────────────────────────────────────
  {
    detect: /\bnewton.{0,10}law|newton.{0,5}(first|second|third|1st|2nd|3rd)/i,
    response: `**Newton's Laws of Motion** ⚙️\n\n**First Law (Law of Inertia):**\nAn object at rest stays at rest, and an object in motion stays in motion, unless acted on by an external force.\n*Example: A ball rolling on a frictionless surface would roll forever.*\n\n**Second Law (F = ma):**\nForce = Mass × Acceleration. The greater the force applied to an object, the greater its acceleration.\n*Example: Pushing a heavy trolley requires more force than pushing an empty one.*\n\n**Third Law (Action-Reaction):**\nFor every action there is an equal and opposite reaction.\n*Example: When you jump, you push down on the ground; the ground pushes you up.*\n\n**Why they matter:**\nThese three laws explain almost all motion we see in everyday life — from cars braking to rockets launching.\n\n💡 *Tip:* Memorise the formula F = ma and practice calculating force, mass, and acceleration from word problems.`,
  },
  {
    detect: /\b(photosynthesis)\b/i,
    response: `**Photosynthesis** 🌿\n\n**What is it?**\nPhotosynthesis is the process by which plants (and some other organisms) convert sunlight, water, and carbon dioxide into glucose (food) and oxygen.\n\n**The equation:**\n6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂\n*(Carbon dioxide + water + light → glucose + oxygen)*\n\n**Where it happens:** In the **chloroplasts** of plant cells, using the green pigment **chlorophyll**.\n\n**Two stages:**\n1. **Light reactions** - Capture sunlight energy, split water, produce ATP and NADPH\n2. **Calvin cycle** - Use that energy to convert CO₂ into glucose\n\n**Simple example:**\nA leaf in sunlight is constantly taking in CO₂ through tiny pores, absorbing water from the stem, and using sunlight to build sugar — releasing oxygen as a by-product. That's why plants are essential to breathable air.\n\n💡 *Tip:* The equation and the two stages are the most common exam questions!`,
  },
  {
    detect: /\b(ohm.{0,5}law|ohms law)\b/i,
    response: `**Ohm's Law** ⚡\n\n**What is it?**\nOhm's Law states the relationship between voltage, current, and resistance in an electrical circuit.\n\n**The formula:**\n**V = I × R**\n- V = Voltage (volts) — the "push" that drives current\n- I = Current (amperes/amps) — the flow of electric charge\n- R = Resistance (ohms, Ω) — opposition to the flow\n\n**Rearranged forms:**\n- I = V / R (find current)\n- R = V / I (find resistance)\n\n**Simple example:**\nA 12V battery connected to a 4Ω resistor:\nI = V/R = 12/4 = **3 amps** of current flows.\n\n**Why it matters:**\nOhm's Law is used to design every electrical circuit — from phone chargers to power grids.\n\n💡 *Tip:* Draw the "magic triangle" (V on top, I and R on bottom) to remember which formula to use depending on what you're solving for.`,
  },
  // ── Mathematics ──────────────────────────────────────────────────────────
  {
    detect: /\b(derivative|differentiation|calculus)\b/i,
    response: `**Derivatives (Differentiation)** 📐\n\n**What is it?**\nA derivative measures how fast a function is changing at any given point — it's the "rate of change" or the slope of a curve.\n\n**Key idea:** If you have a position function, its derivative gives you velocity. The derivative of velocity gives you acceleration.\n\n**Basic rules:**\n- **Power rule:** d/dx(xⁿ) = n·xⁿ⁻¹\n  *Example: d/dx(x³) = 3x²*\n- **Constant rule:** d/dx(c) = 0\n- **Sum rule:** d/dx(f + g) = f' + g'\n- **Chain rule:** d/dx(f(g(x))) = f'(g(x)) · g'(x)\n\n**Common derivatives to memorise:**\n- d/dx(sin x) = cos x\n- d/dx(cos x) = -sin x\n- d/dx(eˣ) = eˣ\n- d/dx(ln x) = 1/x\n\n**Simple example:**\nIf f(x) = x² then f'(x) = 2x. At x = 3, the slope of the curve is 2×3 = 6.\n\n💡 *Tip:* Practice the Power Rule with 10 examples — it covers 80% of derivative problems.`,
  },
  {
    detect: /\b(integration|integral|integrals)\b/i,
    response: `**Integration (Integrals)** ∫\n\n**What is it?**\nIntegration is the reverse of differentiation. It finds the area under a curve or the original function when given its rate of change.\n\n**Two types:**\n1. **Indefinite integral** - Finds the general antiderivative: ∫f(x)dx = F(x) + C\n2. **Definite integral** - Finds the exact area between two points: ∫[a to b] f(x)dx\n\n**Basic rules:**\n- **Power rule:** ∫xⁿ dx = xⁿ⁺¹/(n+1) + C (where n ≠ -1)\n  *Example: ∫x² dx = x³/3 + C*\n- **Constant:** ∫a dx = ax + C\n- ∫eˣ dx = eˣ + C\n- ∫(1/x) dx = ln|x| + C\n\n**Techniques for harder integrals:**\n- Substitution (u-substitution)\n- Integration by parts: ∫u dv = uv - ∫v du\n- Partial fractions\n\n**Simple example:**\n∫2x dx = x² + C. This means x² is the function whose derivative is 2x.\n\n💡 *Tip:* Always add "+ C" to indefinite integrals — forgetting it costs marks!`,
  },
  // ── General concepts ────────────────────────────────────────────────────
  {
    detect: /\b(cloud computing|cloud)\b/i,
    response: `**Cloud Computing** ☁️\n\n**What is it?**\nCloud computing means accessing and storing data, software, and computing power over the internet instead of on your local computer.\n\n**Simple analogy:** Instead of having a generator at home (your own server), you plug into the power grid (the cloud) and only pay for what you use.\n\n**Three main service models:**\n- **IaaS (Infrastructure as a Service)** - Rent virtual machines and storage. *Example: AWS EC2, Azure VMs*\n- **PaaS (Platform as a Service)** - Rent a platform to build apps. *Example: Heroku, Google App Engine*\n- **SaaS (Software as a Service)** - Use software over the internet. *Example: Gmail, Google Docs, Zoom*\n\n**Key benefits:**\n- No hardware to buy or maintain\n- Access from anywhere\n- Scale up or down instantly\n- Pay only for what you use\n\n**Real example:**\nWhen you edit a Google Doc, your text is processed and stored on Google's servers (the cloud) — not on your laptop.\n\n💡 *Tip:* IaaS / PaaS / SaaS is a classic exam question!`,
  },
  {
    detect: /\b(machine learning|ml)\b/i,
    response: `**Machine Learning (ML)** 🤖\n\n**What is it?**\nMachine Learning is a branch of AI where computers learn from data and improve their performance without being explicitly programmed for every task.\n\n**Simple analogy:** Instead of giving a child a rulebook for recognising cats, you show them thousands of cat pictures until they can recognise cats on their own. ML works the same way with data.\n\n**Three types of ML:**\n1. **Supervised Learning** - Learn from labelled data (input + correct output provided)\n   *Example: Email spam filter trained on "spam" and "not spam" emails*\n\n2. **Unsupervised Learning** - Find patterns in unlabelled data\n   *Example: Grouping customers by purchasing behaviour*\n\n3. **Reinforcement Learning** - Learn by trial and error with rewards/penalties\n   *Example: Training a game-playing AI*\n\n**Common ML applications:**\n- Face recognition, voice assistants, recommendation systems, fraud detection\n\n⚠️ *Note: StudyMate AI uses pre-programmed local responses — not ML — and never claims otherwise.*\n\n💡 *Tip:* For exams, understand the difference between supervised and unsupervised learning!`,
  },
  {
    detect: /\b(artificial intelligence|ai)\b/i,
    response: `**Artificial Intelligence (AI)** 🧠\n\n**What is it?**\nArtificial Intelligence is the ability of machines to perform tasks that normally require human intelligence — like understanding language, recognising images, making decisions, or solving problems.\n\n**Key branches of AI:**\n- **Machine Learning** - Systems that learn from data\n- **Natural Language Processing (NLP)** - Understanding and generating human language (e.g. chatbots, translators)\n- **Computer Vision** - Interpreting images and video (e.g. face recognition)\n- **Robotics** - Machines that interact with the physical world\n- **Expert Systems** - Programs that simulate expert human decision-making\n\n**Narrow AI vs General AI:**\n- **Narrow AI** - Does one specific task very well (e.g. chess engine, spam filter). All current AI is narrow AI.\n- **General AI** - Could do anything a human can. Does not exist yet.\n\n**Real-world examples:**\nSiri, Alexa, Google Maps, Netflix recommendations, ChatGPT — all narrow AI.\n\n⚠️ *Note: StudyMate AI's assistant uses pre-programmed pattern matching — it is not an AI model.*\n\n💡 *Tip:* NLP and Machine Learning are the most exam-relevant sub-fields of AI!`,
  },
  {
    detect: /\b(compiler|interpreter)\b/i,
    response: `**Compiler vs Interpreter** 🖥️\n\n**What is a Compiler?**\nA compiler translates your entire program (written in a high-level language like C++) into machine code **all at once** before running it. The result is an executable file.\n\n*Example: You write C++ code → compiler converts it → you run the .exe file*\n\n**What is an Interpreter?**\nAn interpreter translates and runs the program **line by line**, in real time, without producing a separate executable file.\n\n*Example: Python code runs directly through the Python interpreter*\n\n**Key differences:**\n\n| Feature | Compiler | Interpreter |\n|---------|----------|-------------|\n| Translation | All at once | Line by line |\n| Speed | Faster to run | Slower to run |\n| Error detection | After full compilation | Stops at first error |\n| Output | Executable file | No separate file |\n| Examples | C, C++, Java (to bytecode) | Python, JavaScript, Ruby |\n\n**Simple analogy:**\nA compiler is like translating an entire book before publishing it. An interpreter is like a live translator who translates each sentence as it's spoken.\n\n💡 *Tip:* This comparison is a very common exam question in computer science!`,
  },
]


  // Explain a topic
  

// Generic study-topic patterns
const TOPICS = [

  // Explain a topic
  {
    patterns: [
      /explain.{0,20}(topic|concept|term|idea|subject)\b/i,
      /how.{0,10}(to explain|explain).{0,20}(anything|something)/i,
    ],

    responses: [
      `**How to Explain Any Topic in Simple Words** 🎓\n\nUse the **Feynman Technique**:\n\n1. **Pick one specific concept** - e.g. "DBMS", "OOP", "Newton's Laws"\n2. **Explain it as if teaching a 10-year-old** - No jargon, plain language\n3. **Find your gaps** - Where did you get confused or use a term you can't define?\n4. **Go back to your notes** - Fill those gaps\n5. **Use a real analogy** - "A stack is like a stack of plates — last placed, first removed"\n\n**I can directly explain these topics — just ask:**\n- Computer Science: DBMS, SQL, OOP, OS, Algorithms, Data Structures, Recursion, Compiler vs Interpreter, Cloud Computing, AI, Machine Learning\n- Math: Derivatives, Integration\n- Physics: Newton's Laws, Ohm's Law, Photosynthesis\n- Networking: Computer Networks, CPU\n\n*Try typing: "Explain DBMS in simple words" or "What is recursion?"*`,
    ],
  },

  // Create a study plan
  {
    patterns: [
      /study.{0,10}plan/i,
      /create.{0,15}plan/i,
      /plan.{0,15}study/i,
      /schedule.{0,15}study/i,
      /how.{0,10}organis/i,
      /how.{0,10}organiz/i,
    ],
    responses: [
      `**Here's how to build an effective study plan:**\n\n**Step 1 - Take stock**\n- List all your subjects and upcoming exam/assignment dates\n- Estimate how many hours each topic needs\n\n**Step 2 - Set a weekly schedule**\n- Block fixed study slots (treat them like classes)\n- Study your hardest subjects when your energy is highest\n- Mix subjects to avoid fatigue\n\n**Step 3 - Apply the 50/10 rule**\n- 50 minutes of focused study then 10 minute break\n- No phones during the 50 minutes\n\n**Step 4 - Review daily**\n- Spend the last 10 minutes reviewing what you covered\n- This alone doubles retention\n\n**Step 5 - Track and adjust**\n- Mark sessions done in the **Study Planner** page\n- Adjust the plan weekly based on progress\n\n💡 *Pro tip:* Use the **Exam Schedule** page to add your deadlines, then work backwards in the **Study Planner** to create a realistic timeline. 📅`,
    ],
  },

  // Generate quiz questions
  {
    patterns: [
      /quiz.{0,15}question/i,
      /generate.{0,15}quiz/i,
      /test.{0,15}myself/i,
      /practice.{0,15}question/i,
      /make.{0,15}question/i,
      /create.{0,15}quiz/i,
    ],
    responses: [
      `**Generating Quiz Questions - Strategies & Samples:**\n\nI can't dynamically generate questions from your specific notes yet, but here's how to create great quiz questions yourself - plus sample questions across common subjects:\n\n**How to write your own quiz questions:**\n1. Read a section of your notes\n2. Close the notes\n3. Write "What, How, Why, When, Explain" questions from memory\n4. Answer them - then check\n\n**Sample questions by subject:**\n\n🧮 **Math / Calculus:**\n- What is the derivative of sin(x)?\n- State the Fundamental Theorem of Calculus\n- Solve: integral of 2x dx\n\n💻 **Computer Science:**\n- What is the time complexity of binary search?\n- Explain the difference between a stack and a queue\n- What does O(n log n) mean?\n\n⚛️ **Physics:**\n- State Newton's three laws of motion\n- What is the formula for kinetic energy?\n- Explain the photoelectric effect\n\n📝 **General study:**\n- What are the key points from today's lecture?\n- How does concept A relate to concept B?\n- What would happen if the key variable changed?\n\n💡 Tip: Save your quiz questions as a **Note** in the Notes page so you can review them later! 🗒️`,
    ],
  },

  // Summarize notes
  {
    patterns: [
      /summari[sz]e.{0,20}note/i,
      /note.{0,10}summary/i,
      /condense.{0,15}note/i,
      /key.{0,10}point/i,
      /main.{0,10}point/i,
    ],
    responses: [
      `**How to Summarize Your Notes Effectively:**\n\nI can't read your notes directly yet, but here's the most effective summarization method:\n\n**The 3-Pass Technique:**\n\n📖 **Pass 1 - Skim (2 min)**\n- Read headings and first sentences only\n- Get the overall structure in your head\n\n📖 **Pass 2 - Read actively (full time)**\n- Underline only the most essential sentences\n- Write a one-line summary per paragraph in the margin\n\n📖 **Pass 3 - Compress (5 min)**\n- Without looking at the notes, write a 5-sentence summary\n- Include: main idea, 3 supporting points, 1 conclusion\n\n**Cornell Note Summary Structure:**\n\n- **Topic:** One-line title\n- **Key facts:** Bullet points, max 5\n- **Formulas/dates:** Only the critical ones\n- **So what?:** Why does this matter?\n- **Review question:** One question to test yourself\n\n💡 *Tip:* After summarizing, save the compressed version as a new **Note** in StudyMate - this becomes your revision card before the exam! 📝`,
    ],
  },

  // Help prepare for exam
  {
    patterns: [
      /help.{0,20}(prepare|prep).{0,20}exam/i,
      /prepare.{0,10}for.{0,10}(exam|test)/i,
      /help.{0,15}exam/i,
      /ready.{0,10}for.{0,10}exam/i,
      /exam.{0,10}ready/i,
    ],
    responses: [
      `**Complete Exam Preparation Guide:**\n\n⏳ **4+ weeks out - Foundation**\n- Attend all classes and keep notes current\n- Review notes within 24h of each lecture\n- Add the exam to your **Exam Schedule** page now\n\n📅 **2 weeks out - Consolidation**\n- Make a topic checklist (everything that could be tested)\n- Identify your weak areas - focus 70% of time there\n- Start doing past papers or practice questions\n- Create a daily study block in the **Study Planner**\n\n⚡ **1 week out - Intensification**\n- Work through practice problems under timed conditions\n- Review all your summary notes\n- Form or join a study group for discussion\n- Avoid learning completely new material now\n\n🔥 **3 days out - Refinement**\n- Focus only on weak areas and key formulas\n- Do one full mock exam / practice test\n- Prepare your exam kit (pens, ID, calculator)\n\n😴 **Night before**\n- Light review only - max 1 hour\n- No new material\n- Sleep 8 hours minimum - this is non-negotiable\n\n🌅 **Day of exam**\n- Eat a proper breakfast (glucose = brain fuel)\n- Arrive 15 minutes early\n- Read the entire paper before starting\n- Attempt every question - partial marks count\n\nGood luck - you've got this! 💪`,
    ],
  },

  // Explain a programming problem
  {
    patterns: [
      /explain.{0,20}programming/i,
      /explain.{0,20}(code|algorithm|function|loop|recursion|array|linked list|binary tree|sorting|searching)/i,
      /programming.{0,15}problem/i,
      /how.{0,15}(recursion|algorithm|pointer|stack|queue|heap|hash|graph|tree).{0,10}work/i,
    ],
    responses: [
      `**Programming Problem Walkthrough - Framework:**\n\nWhen faced with any programming problem, use this structured approach:\n\n**1. Understand the problem** 📋\n- What are the inputs? What are the expected outputs?\n- What are the constraints? (time, memory, edge cases)\n- Restate it in your own words\n\n**2. Plan before you code** 🗺️\n- Identify the data structure needed (array, tree, hash map)\n- Identify the algorithm pattern:\n  - Sorting: use merge sort / quicksort\n  - Searching: binary search\n  - Optimization: dynamic programming / greedy\n  - Graph problems: BFS / DFS\n  - Recursion: define base case + recursive case\n\n**3. Write pseudocode first** ✍️\n- No syntax, just logic\n- Then translate to actual code\n\n**4. Test with examples** 🧪\n- Test the happy path\n- Test edge cases: empty input, single element, maximum size\n\n**5. Analyse complexity** ⚡\n- Time complexity: how does runtime grow with input size?\n- Space complexity: how much memory does it use?\n\n**Common patterns reminder:**\n\n- **Two pointers:** Sorted arrays, palindromes\n- **Sliding window:** Subarray/substring problems\n- **DFS/BFS:** Tree or graph traversal\n- **DP:** Overlapping subproblems\n- **Divide & conquer:** Merge sort, binary search\n\nIf you share the specific problem, I'll walk through it with you! 💻`,
    ],
  },

  // Pomodoro / time management
  {
    patterns: [/pomodoro/i, /focus.{0,10}technique/i, /time.{0,10}manag/i],
    responses: [
      `**The Pomodoro Technique** is one of the most effective focus methods:\n\n1. Choose a task to work on\n2. Set a timer for **25 minutes** and work with full focus\n3. Take a **5-minute break**\n4. After 4 pomodoros, take a longer **15-30 min break**\n\nThis works because our brains focus better in short bursts. Try it with your next study session in the Planner! 🍅`,
    ],
  },

  // Spaced repetition
  {
    patterns: [/spaced.{0,10}repetition/i, /flash.?card/i, /memoriz/i, /remember/i],
    responses: [
      `**Spaced Repetition** is the gold standard for memory:\n\n- Review new material **1 day** after learning\n- Then again after **3 days**, **1 week**, **2 weeks**, and **1 month**\n- Each review strengthens the memory trace\n\nTools like Anki use this automatically. For notes in StudyMate, try tagging notes you need to review and revisiting them on a schedule. 🧠`,
    ],
  },

  // Active recall
  {
    patterns: [/active.{0,10}recall/i, /retrieval.{0,10}practice/i, /self.{0,10}test/i, /quiz yourself/i],
    responses: [
      `**Active Recall** beats passive re-reading every time:\n\n✅ Close your notes and try to recall key points\n✅ Write down everything you remember, then check\n✅ Use the Cornell Note method - cover the right column, recite from cues\n✅ Teach the concept to an imaginary student (Feynman Technique)\n\nPassive highlighting gives a false sense of learning. Active testing reveals real gaps. 💡`,
    ],
  },

  // Note-taking
  {
    patterns: [/note.{0,10}taking/i, /how.{0,8}take.{0,8}note/i, /cornell/i],
    responses: [
      `Here are the **top note-taking strategies** for college:\n\n**Cornell Method** - Divide pages into cue column (left), notes (right), summary (bottom). Great for lectures.\n\n**Mind Maps** - Visual diagrams connecting main ideas. Great for complex subjects.\n\n**Outline Method** - Hierarchical bullet points. Great for structured content like textbooks.\n\n**Charting** - Tables comparing multiple items. Great for science/history.\n\nWhatever method you choose, always review within 24 hours! 📝`,
    ],
  },

  // Exam prep (general)
  {
    patterns: [/exam.{0,10}prep/i, /study.{0,10}exam/i, /how.{0,10}study/i],
    responses: [
      `**Exam Preparation Strategy:**\n\n📅 **2 weeks before:** Map all topics, identify gaps, create a study schedule\n📅 **1 week before:** Work through practice problems and past papers\n📅 **3 days before:** Focus on weak areas and do full practice tests\n📅 **Day before:** Light review only - no new material. Sleep 8 hours.\n📅 **Day of:** Eat breakfast, arrive early, read instructions carefully\n\nUse the **Exam Schedule** page to set your exam date and the **Study Planner** to block study sessions. 🎯`,
    ],
  },

  // Procrastination / motivation
  {
    patterns: [/procrastinat/i, /can't.{0,10}start/i, /motivat/i, /lazy/i, /distract/i],
    responses: [
      `**Beating Procrastination:**\n\n🔑 **The 2-Minute Rule** - If it takes less than 2 minutes, do it now\n🔑 **Eat the Frog** - Do your hardest task first thing\n🔑 **Environment design** - Put your phone in another room, use a website blocker\n🔑 **Implementation intention** - "I will study at 4pm at the library" is 2-3x more effective than "I'll study today"\n🔑 **Self-compassion** - Don't spiral into guilt; just restart\n\nTry adding your session to the **Study Planner** right now. 💪`,
    ],
  },

  // Math
  {
    patterns: [/math/i, /calculus/i, /algebra/i, /equation/i, /formula/i],
    responses: [
      `**Tips for mastering Math:**\n\n1. **Understand, don't memorize** - Know why each formula works\n2. **Practice daily** - Even 20 minutes a day beats 3-hour cram sessions\n3. **Work backwards** - Start from the solution on hard problems to understand the reasoning\n4. **Build on basics** - Find and fill foundational gaps (e.g., weak algebra hurts calculus)\n5. **Write out all steps** - Skipping steps is where mistakes hide\n\nAdd your Math subject in **Subjects** and track assignments there! 📐`,
    ],
  },

  // Programming (general)
  {
    patterns: [/programming/i, /coding/i, /computer science/i, /debug/i, /\bcode\b/i],
    responses: [
      `**Learning to Code Effectively:**\n\n💻 **Build projects** - Theory alone doesn't stick; you need to apply it\n💻 **Read others' code** - Open-source projects are free textbooks\n💻 **Rubber duck debugging** - Explain the problem out loud to find the bug\n💻 **Break it down** - Decompose problems into smaller sub-problems\n💻 **Consistent practice** - 1 hour daily beats 7 hours on Saturday\n\nTrack your CS assignments in the **Assignments** page and note key concepts in **Notes**! 🚀`,
    ],
  },

  // Stress / anxiety / burnout
  {
    patterns: [/stress/i, /anxiet/i, /overwhelm/i, /burn.?out/i, /tired/i],
    responses: [
      `It sounds like things feel heavy right now. Here are evidence-based strategies:\n\n🌿 **Physical:** Regular sleep (7-9h), daily exercise (even a 20-min walk), proper meals\n🌿 **Mental:** Break work into small chunks, celebrate small wins, set boundaries on screen time\n🌿 **Social:** Talk to a friend, professor, or counselor - don't go it alone\n🌿 **Academic:** Visit office hours, ask for extensions when needed, prioritise tasks\n\nYou can't pour from an empty cup. Taking care of yourself *is* part of the strategy. 💚`,
    ],
  },

  // Sleep / rest
  {
    patterns: [/sleep/i, /\brest\b/i, /\bnap\b/i],
    responses: [
      `**Sleep is non-negotiable for learning:**\n\n🛌 Your brain consolidates memories during deep sleep - skimping on sleep literally erases what you studied\n🛌 Aim for **7-9 hours** consistently (same bedtime helps)\n🛌 Avoid screens for 30 min before bed\n🛌 A **20-minute nap** can restore focus without grogginess\n🛌 Prioritise sleep the night before an exam over late cramming. 💤`,
    ],
  },

  // Essay / writing
  {
    patterns: [/essay/i, /thesis/i, /research.{0,10}paper/i],
    responses: [
      `**Essay Writing Framework:**\n\n📝 **Before you write:**\n- Understand the prompt exactly\n- Brainstorm, then outline (intro, 3 body paragraphs, conclusion)\n- Gather sources early\n\n📝 **Drafting:**\n- Write the body first, intro last\n- Each paragraph = one idea + evidence + analysis\n- Don't self-edit while drafting\n\n📝 **Revising:**\n- Read aloud to catch awkward phrasing\n- Check argument flow, not just grammar\n- Leave a day between drafting and editing\n\nSave your outline as a **Note** in StudyMate! 📖`,
    ],
  },

  // GPA / grades
  {
    patterns: [/gpa/i, /grade/i, /\bfail\b/i, /\bpass\b/i, /\bscore\b/i],
    responses: [
      `**Improving Your Grades:**\n\n🎯 **Attend every class** - Simply showing up is the highest-return action\n🎯 **Participate** - Professors remember engaged students\n🎯 **Start assignments early** - Quality drops sharply in the last 2 hours before a deadline\n🎯 **Visit office hours** - Most professors *want* to help\n🎯 **Form study groups** - Explaining to peers deepens your own understanding\n🎯 **Review feedback** - Re-read graded work to understand mistakes\n\nTrack all assignments in the **Assignments** page so nothing slips! ✅`,
    ],
  },

  // Greetings
  {
    patterns: [/^(hi|hello|hey|howdy|hiya|greetings)/i, /how are you/i, /what'?s up/i],
    responses: [
      `Hello! 👋 I'm your StudyMate AI Assistant - ready to help you study smarter.\n\nYou can ask me about:\n- Study techniques (Pomodoro, spaced repetition, active recall)\n- Exam preparation strategies\n- Note-taking and summarising methods\n- Creating study plans and quiz questions\n- Managing stress and motivation\n- Programming and subject-specific tips\n\nWhat's on your mind?`,
    ],
  },

  // Thanks
  {
    patterns: [/thank/i, /helpful/i],
    responses: [
      `You're very welcome! 😊 Keep up the great work - consistent effort beats last-minute cramming every time. Anything else I can help with?`,
      `Happy to help! 🎓 I'm always here whenever you need study tips or strategies.`,
    ],
  },

  // Who are you / capabilities
  {
    patterns: [/who are you/i, /what.{0,10}(can you|you) do/i, /your (capabilities|features|abilities)/i],
    responses: [
      `I'm the **StudyMate AI Assistant** - a built-in local assistant designed for college students. 🤖\n\n⚠️ **Heads up:** I use pre-programmed local responses - I'm not connected to an external AI service like ChatGPT. Think of me as a smart study guide always available offline.\n\n**What I can help with:**\n- 📚 Study strategies (Pomodoro, spaced repetition, active recall)\n- 🎯 Exam preparation guides\n- 📝 Note-taking, essay writing, and summarisation tips\n- 📅 Building a personalised study plan\n- ❓ Generating practice quiz questions\n- 💻 Programming problem-solving frameworks\n- 💪 Motivation, stress management, and burnout recovery\n- 🔢 Subject tips (Math, CS, Physics, and more)\n\nJust type a question or tap one of the suggested prompts below!`,
    ],
  },
]

const FALLBACK_RESPONSES = [
  `That's an interesting question! While my local knowledge base doesn't cover every topic, here's what I *can* help with:\n\n- 📅 **Study plans** - *"Create a study plan for my exams"*\n- ❓ **Quiz questions** - *"Generate quiz questions for calculus"*\n- 📝 **Note summaries** - *"How do I summarize my notes?"*\n- 🎯 **Exam prep** - *"Help me prepare for an exam"*\n- 💻 **Programming** - *"Explain this programming problem"*\n- 🧠 **Study techniques** - *"What is spaced repetition?"*\n\nTry rephrasing your question or pick one of the suggested prompts below! 👇`,
  `I'm not sure about that specific topic yet - my responses are built in locally without an external AI connection.\n\nHere's what works well:\n\n📖 Study techniques · 🎯 Exam prep · 📅 Study planning\n💻 Programming help · 📝 Writing tips · 💪 Motivation\n\nWhat study challenge can I help you tackle today?`,
]

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getAssistantResponse(userMessage, context) {
  const msg = userMessage.trim()
  if (!msg) return null

  // Context-aware responses (reads real user data from localStorage)
  if (/my (subjects|courses)/i.test(msg) && context?.subjects?.length) {
    const list = context.subjects.map(s => `${s.icon} **${s.name}**`).join(', ')
    return `You're currently enrolled in **${context.subjects.length}** subject(s): ${list}.\n\nWould you like study tips or a study plan for any of these?`
  }

  if (/my (assignments|homework|tasks)/i.test(msg)) {
    const pending = context?.assignments?.filter(a => a.status === 'pending') || []
    if (pending.length === 0) {
      return `🎉 Great news - you have no pending assignments right now! Time to get ahead or review old material using spaced repetition.`
    }
    const sorted = [...pending].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4)
    const sample = sorted.map(a => `- **${a.title}** - due ${a.dueDate}`).join('\n')
    return `You have **${pending.length}** pending assignment(s). The next ones due:\n\n${sample}\n\nWould you like tips on tackling them efficiently?`
  }

  if (/my (exams|upcoming exams)/i.test(msg)) {
    const today = new Date().toISOString().split('T')[0]
    const upcoming = (context?.exams || [])
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
    if (upcoming.length === 0) {
      return `You have no upcoming exams scheduled. Use the **Exam Schedule** page to add them and start the countdown! ⏱️`
    }
    const next = upcoming[0]
    const sub = (context?.subjects || []).find(s => s.id === next.subjectId)
    const diff = Math.max(0, Math.round((new Date(next.date + 'T00:00:00') - new Date()) / 86400000))
    return `Your next exam is **${next.title || sub?.name || 'Unknown'}** in **${diff} day(s)**${sub ? ` (${sub.name})` : ''}.\n\nYou have ${upcoming.length} total upcoming exam(s). Would you like a full exam preparation guide?`
  }

  // ── Direct topic explanation ──────────────────────────────────────────────
  // Detects "explain X", "what is X", "tell me about X", "describe X" style
  // queries and looks up X in the TOPIC_EXPLANATIONS knowledge base.
  // Runs BEFORE the generic TOPICS loop so specific questions always win.
  const isExplainQuery = (
    /\bexplain\b/i.test(msg) ||
    /\bwhat (is|are|does)\b/i.test(msg) ||
    /\btell me about\b/i.test(msg) ||
    /\bdescribe\b/i.test(msg) ||
    /\bin simple words\b/i.test(msg) ||
    /\bsimply explain\b/i.test(msg)
  )

  if (isExplainQuery) {
    for (const entry of TOPIC_EXPLANATIONS) {
      if (entry.detect.test(msg)) {
        return entry.response
      }
    }
  }

  // Also check TOPIC_EXPLANATIONS even without explicit "explain" trigger —
  // e.g. "DBMS?" or "what does SQL mean" or bare topic names
  for (const entry of TOPIC_EXPLANATIONS) {
    if (entry.detect.test(msg)) {
      return entry.response
    }
  }

  // ── Generic TOPICS pattern matching ──────────────────────────────────────
  for (const topic of TOPICS) {
    if (topic.patterns.some(p => p.test(msg))) {
      return pickRandom(topic.responses)
    }
  }

  return pickRandom(FALLBACK_RESPONSES)
}

// Suggested prompts shown in the chat UI
export const SUGGESTED_PROMPTS = [
  { label: 'Explain a topic simply',        text: 'Explain a topic in simple words',        icon: '💡' },
  { label: 'Create a study plan',           text: 'Create a study plan for my subjects',     icon: '📅' },
  { label: 'Generate quiz questions',       text: 'Generate quiz questions for my subjects', icon: '❓' },
  { label: 'Summarize my notes',            text: 'Summarize my notes effectively',          icon: '📝' },
  { label: 'Prepare for an exam',           text: 'Help me prepare for an exam',             icon: '🎯' },
  { label: 'Explain a programming problem', text: 'Explain this programming problem',        icon: '💻' },
  { label: 'My upcoming assignments',       text: 'What are my upcoming assignments?',       icon: '✅' },
  { label: 'Beat procrastination',          text: 'How to avoid procrastination?',           icon: '🔑' },
]

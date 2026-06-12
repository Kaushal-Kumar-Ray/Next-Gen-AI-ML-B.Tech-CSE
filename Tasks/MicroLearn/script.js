// ================= DATA =================
const learningData = [
    { id: 1, title: "Stack", category: "DSA",
      explanation: ["LIFO", "Push/Pop", "Used in recursion"],
      question: "Which data structure is used in Undo operation?",
      answer: "Stack" },

    { id: 2, title: "Queue", category: "DSA",
      explanation: ["FIFO", "Enqueue/Dequeue", "Used in scheduling"],
      question: "Which structure is used in CPU scheduling?",
      answer: "Queue" },

    { id: 3, title: "Binary Search", category: "DSA",
      explanation: ["Divide & conquer", "Sorted array", "Efficient"],
      question: "What is time complexity of binary search?",
      answer: "O(log n)" },

    { id: 4, title: "Recursion", category: "DSA",
      explanation: ["Function calls itself", "Needs base case"],
      question: "What happens without base case?",
      answer: "Stack overflow" },

    { id: 5, title: "Linked List", category: "DSA",
      explanation: ["Dynamic size", "Pointers", "No random access"],
      question: "Main advantage of linked list?",
      answer: "Dynamic memory" },

    { id: 6, title: "HTML", category: "Web",
      explanation: ["Structure", "Tags", "Semantic layout"],
      question: "What does HTML stand for?",
      answer: "HyperText Markup Language" },

    { id: 7, title: "CSS", category: "Web",
      explanation: ["Styling", "Layout", "Responsive"],
      question: "Which property controls outer spacing?",
      answer: "Margin" },

    { id: 8, title: "HTTPS", category: "Web",
      explanation: ["Encrypted", "Secure", "Uses SSL"],
      question: "Why HTTPS is important?",
      answer: "Secures data" },

    { id: 9, title: "DOM", category: "Web",
      explanation: ["Tree structure", "JS manipulates"],
      question: "What is DOM used for?",
      answer: "Manipulating webpage" },

    { id: 10, title: "Responsive Design", category: "Web",
      explanation: ["Mobile-first", "Flexible layout"],
      question: "What enables responsive design?",
      answer: "Media queries" },

    { id: 11, title: "Closures", category: "JavaScript",
      explanation: ["Inner function", "Remembers scope"],
      question: "What is closure?",
      answer: "Function remembering outer scope" },

    { id: 12, title: "Promises", category: "JavaScript",
      explanation: ["Async handling", "Future value"],
      question: "What does a promise return?",
      answer: "Future value" },

    { id: 13, title: "Event Loop", category: "JavaScript",
      explanation: ["Async engine", "Queue + stack"],
      question: "Why JS is non-blocking?",
      answer: "Event loop" },

    { id: 14, title: "let vs var", category: "JavaScript",
      explanation: ["let = block scope", "var = function scope"],
      question: "Which is block scoped?",
      answer: "let" },

    { id: 15, title: "Arrow Functions", category: "JavaScript",
      explanation: ["Short syntax", "No own this"],
      question: "Do arrow functions have their own this?",
      answer: "No" }
];

// ================= STATE =================
let state = {
    index: 0,
    filter: "All",
    filteredData: [...learningData],
    // BUG FIX: guard against corrupted localStorage values with a fallback
    learned: (() => {
        try {
            return JSON.parse(localStorage.getItem("learned")) || [];
        } catch (e) {
            return [];
        }
    })()
};

// ================= ELEMENTS =================
const flashcard     = document.getElementById("flashcard");
const question      = document.getElementById("cardQuestion");
const answer        = document.getElementById("cardAnswer");
const categoryFront = document.getElementById("cardCategoryFront");
const categoryBack  = document.getElementById("cardCategoryBack");
const progress      = document.getElementById("progressText");
const btnPrev       = document.getElementById("btnPrev");
const btnNext       = document.getElementById("btnNext");
const btnLearned    = document.getElementById("btnLearned");
const filterContainer = document.getElementById("filterContainer");
const conceptGrid   = document.getElementById("conceptGrid");

// Mobile menu elements
const menuBtn = document.getElementById("menu-btn");
const navMenu = document.getElementById("nav-menu");

// ================= INIT =================
// BUG FIX: Removed the `initialized` guard + DOMContentLoaded wrapper.
// The script tag uses `defer`, so it already runs after DOM is ready.
// The double-init guard was masking the real problem: inline onclick handlers
// in the HTML were firing alongside addEventListener calls — causing every
// action (flip, next, prev, learned) to trigger TWICE. Fix: removed all
// onclick="..." attributes from Micro.html; keep only addEventListener here.

function init() {
    if (!flashcard) {
        console.error("Missing required HTML elements — check element IDs.");
        return;
    }

    renderFilters();
    loadCard();
    renderConcepts();

    // Single source of truth for all event listeners
    btnNext.addEventListener("click", nextCard);
    btnPrev.addEventListener("click", prevCard);
    btnLearned.addEventListener("click", toggleLearned);
    flashcard.addEventListener("click", flipCard);

    // BUG FIX: Mobile menu toggle was never wired up — menu button did nothing
    if (menuBtn && navMenu) {
        menuBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });
    }
}

// ================= FLASHCARD =================
function loadCard() {
    if (state.filteredData.length === 0) {
        question.textContent = "No cards in this category.";
        answer.textContent   = "Try selecting a different filter.";
        progress.textContent = "0 / 0";
        btnPrev.disabled     = true;
        btnNext.disabled     = true;
        return;
    }

    const item = state.filteredData[state.index];

    question.textContent        = item.question;
    answer.textContent          = item.answer;
    categoryFront.textContent   = item.category;
    categoryBack.textContent    = item.category;

    progress.textContent = `${state.filter} • ${state.index + 1} / ${state.filteredData.length}`;

    btnPrev.disabled = state.index <= 0;
    btnNext.disabled = state.index >= state.filteredData.length - 1;

    if (state.learned.includes(item.id)) {
        btnLearned.classList.add("active");
        btnLearned.textContent = "Learned ✓";
    } else {
        btnLearned.classList.remove("active");
        btnLearned.textContent = "Mark as Learned";
    }

    // Reset flip state when navigating to a new card
    flashcard.classList.remove("flipped");
}

// ================= ACTIONS =================
function flipCard() {
    flashcard.classList.toggle("flipped");
}

function nextCard() {
    if (state.index < state.filteredData.length - 1) {
        state.index++;
        loadCard();
    }
}

function prevCard() {
    if (state.index > 0) {
        state.index--;
        loadCard();
    }
}

function toggleLearned() {
    const current = state.filteredData[state.index];
    if (!current) return;

    const i = state.learned.indexOf(current.id);
    if (i === -1) state.learned.push(current.id);
    else state.learned.splice(i, 1);

    localStorage.setItem("learned", JSON.stringify(state.learned));

    loadCard();
    renderConcepts();
}

// ================= FILTER =================
function renderFilters() {
    const categories = ["All", ...new Set(learningData.map(x => x.category))];

    filterContainer.innerHTML = "";

    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.textContent = cat;
        btn.className   = "filter-btn";

        if (cat === state.filter) btn.classList.add("active");

        btn.addEventListener("click", () => setFilter(cat));

        filterContainer.appendChild(btn);
    });
}

function setFilter(cat) {
    state.filter = cat;
    state.index  = 0;

    state.filteredData = cat === "All"
        ? [...learningData]
        : learningData.filter(x => x.category === cat);

    flashcard.classList.remove("flipped");

    renderFilters();
    loadCard();
    renderConcepts();
}

// ================= CONCEPTS =================
function renderConcepts() {
    conceptGrid.innerHTML = "";

    const data = state.filter === "All"
        ? learningData
        : learningData.filter(x => x.category === state.filter);

    data.forEach(item => {
        const isLearned = state.learned.includes(item.id);

        const div = document.createElement("div");
        div.className = "concept-card";

        div.innerHTML = `
            <h3>${item.title}${isLearned ? " ✓" : ""}</h3>
            <ul>${item.explanation.map(e => `<li>${e}</li>`).join("")}</ul>
        `;

        conceptGrid.appendChild(div);
    });
}

// ================= START =================
// BUG FIX: script uses `defer` in HTML so DOM is ready here — no need for
// DOMContentLoaded wrapper. Calling init() directly is correct and simpler.
init();
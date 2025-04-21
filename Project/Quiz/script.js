const startButton = document.querySelector(".start_quiz");
const quizBox = document.querySelector(".quiz-box");
const resultBox = document.querySelector(".result-box");
const questionText = document.getElementById("question");
const optionsBox = document.querySelector(".options");
const nextButton = document.querySelector(".next-btn");
const scoreText = document.getElementById("score");
const countQue = document.querySelector(".count_que");
const totalQue = document.querySelector(".total_que");
const playAgainButton = document.querySelector(".again-quiz");
const exitButton = document.querySelector(".exit");

const questions = [
    {
        question: " What is a data structure?",
        answer: "A way to organize and store data efficiently  ",
        options: ["A programming language  ", "A way to organize and store data efficiently  ", "A type of computer hardware  ", " A mathematical formula"]
    },
    {
        question: " Which is an example of a String array in Python?",
        answer: "['apple', 'banana']",
        options: ["[1, 2, 3]", "['apple', 'banana']", "{'a', 'b', 'c'}", "(1, 2, 3)"]
    },
    {
        question: "Indexing in arrays typically starts at:",
        answer: "0",
        options: ["0", "-1", "1", "Infinity"]
    },
    {
        question: "Which is NOT an advantage of arrays?",
        answer: "Dynamic resizing",
        options: ["Constant-time element access", "Contiguous memory allocation", "Dynamic resizing", "Cache-friendly"]
    },
    {
        question: "Which is a non-linear data structure?",
        answer: "Tree",
        options: ["Array", "LinkedList", "Tree", "Stack"]
    },
    {
        question: "A data type differs from a data structure in that: ",
        answer: "Data structures organize data, types define data nature",
        options: ["Data types organize data, structures define data nature", "Data structures organize data, types define data nature", "Both are the same", "Data types are only for integers"]
    },
    {
        question: "Which is a primitive data type?",
        answer: "int",
        options: ["Array", "List", "Sets", "int"]
    },
    {
        question: "A linked list is preferred over an array when",
        answer: "Dynamic size is required",
        options: ["Random access is needed", "Dynamic size is required", "Memory must be contiguous", "Fixed data storage is needded"]
    },
    {
        question: "Which Python type is immutable?",
        answer: "String",
        options: ["List", "Dictionary", "Sets", "String"]
    },
    {
        question: "Choosing the right data structure primarily affects:",
        answer: "Time and space efficiency",
        options: ["Loop syntax", "Variable naming", "Time and space efficiency", "Code color scheme"]
    },
    {
        question: "Which is a linear data structure?",
        answer: "Queue",
        options: ["Tree", "Graph", "Queue", "Hash Table"]
    },
    {
        question: "A static data structure has:",
        answer: "Fixed size at compile time",
        options: ["Runtime size changes", "Fixed size at compile time", "Pointers for flexibility", "Hierarchical storage"]
    },
    {
        question: "Python's built-in list is implemented as:",
        answer: "Dynamic array",
        options: ["Linked list", "Dynamic array", "Stack", "Heap"]
    },
    {
        question: "Static memory allocation occurs:",
        answer: "At compile time",
        options: ["During runtime", "At compile time", "When using malloc()", "Never in Python"]
    },
    {
        question: "Python manages memory using:",
        answer: "Garbage collection and a private heap",
        options: ["Manual allocation", "Garbage collection and a private heap", "Static allocation only", "Stack-only allocation"]
    },
    {
        question: "A memory leak occurs when:",
        answer: "Allocated memory is not released",
        options: ["Memory is freed too quickly", "Allocated memory is not released", "The heap is empty", "The stack overflows "]
    },
    {
        question: "Stack memory is used for:",
        answer: "Function call management (LIFO)",
        options: ["Infinite loops ", "Function call management (LIFO)", "Faster execution", "Large data structures"]
    },
    {
        question: "A base case in recursion ensures:",
        answer: "Termination of recursive calls",
        options: ["Infinite loops ", "Termination of recursive calls", "Faster execution", "Large data structures"]
    },
    {
        question: "The time complexity of accessing an array element by index is:",
        answer: "O(1)",
        options: ["O(n)", "O(1)", "O(log n)", "O(n²)"]
    },
    {
        question: "A queue follows:",
        answer: "FIFO",
        options: ["LIFO", "Priority-based order", "Random order", "FIFO"]
    }

    
];

let currentQuestion = 0;
let score = 0;

totalQue.textContent = questions.length;

startButton.addEventListener("click", () => {
    startButton.classList.add("inactive");
    quizBox.classList.remove("inactive");
    loadQuestion();
});

function loadQuestion() {
    if (currentQuestion >= questions.length) {
        showResults();
        return;
    }

    let q = questions[currentQuestion];
    questionText.textContent = q.question;
    optionsBox.innerHTML = "";
    countQue.textContent = currentQuestion + 1;

    q.options.forEach(opt => {
        let div = document.createElement("div");
        div.classList.add("option");
        div.textContent = opt;
        div.onclick = () => checkAnswer(div, q.answer);
        optionsBox.appendChild(div);
    });

    nextButton.classList.add("inactive");
}

function checkAnswer(selected, correct) {
    let options = document.querySelectorAll(".option");
    options.forEach(option => option.onclick = null);

    if (selected.textContent === correct) {
        selected.classList.add("correct");
        score++;
    } else {
        selected.classList.add("incorrect");
        options.forEach(option => {
            if (option.textContent === correct) option.classList.add("correct");
        });
    }

    nextButton.classList.remove("inactive");
}

nextButton.addEventListener("click", () => {
    currentQuestion++;
    loadQuestion();
});

function showResults() {
    quizBox.classList.add("inactive");
    resultBox.classList.remove("inactive");
    scoreText.textContent = `Your Score: ${score} / ${questions.length}`;
}

playAgainButton.addEventListener("click", () => {
    currentQuestion = 0;
    score = 0;
    resultBox.classList.add("inactive");
    quizBox.classList.remove("inactive");
    loadQuestion();
});

exitButton.addEventListener("click", () => {
    location.reload();
});

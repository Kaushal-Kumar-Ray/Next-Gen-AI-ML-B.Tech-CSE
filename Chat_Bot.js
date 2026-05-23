const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbot = document.getElementById("chatbot");
const closeBtn = document.getElementById("chatbot-close");
const messages = document.getElementById("chatbot-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

// Toggle chatbot
chatbotToggle.onclick = (e) => {
  createRipple(e);
  chatbot.classList.toggle("show");
  if (!chatbot.classList.contains("show")) {
    setTimeout(() => (chatbot.style.display = "none"), 300);
  } else {
    chatbot.style.display = "flex";
  }
};

// Close button
closeBtn.onclick = () => {
  chatbot.classList.remove("show");
  setTimeout(() => (chatbot.style.display = "none"), 300);
};

// Send on button click or Enter
sendButton.onclick = sendMessage;
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const userText = userInput.value.trim();
  if (!userText) return;

  appendMessage("You", userText, "user");
  userInput.value = "";
  respondTo(userText.toLowerCase());
}

function appendMessage(sender, text, className) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const message = document.createElement("div");
  message.className = `chatbot-message ${className}`;
  message.innerText = `${text} (${time})`;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

function respondTo(query) {
 const responses = [
  // Greetings & small talk
  {
    keywords: ["Hi", "Hello", "hi", "yo"],
    response: "Heyyy! What’s up? How can I help you with your AI & ML journey today?"
  },
  {
    keywords: ["How are you", "How", "what's up"],
    response: "I’m doing awesome, thanks for asking! Ready to help you ace your studies."
  },
  {
    keywords: ["Thanks", "Thank you", "thx"],
    response: "No prob! Happy to help anytime 😊"
  },
  {
    keywords: ["bye", "goodbye", "see ya", "later"],
    response: "Catch you later! Don’t hesitate to drop by if you need anything else."
  },

  // Website info
  {
    keywords: ["What", "site", "about"],
    response: "This site’s your go-to spot for B.Tech CSE students diving into AI & ML with notes, blogs, and projects."
  },
  {
    keywords: ["Who", "made", "created", "author"],
    response: "Kaushal Kumar Ray put this all together — big brain behind the scenes!"
  },
  {
    keywords: ["blog", "articles", "posts"],
    response: "Our blog’s packed with fresh AI & ML tutorials and cool project ideas. Worth checking out!"
  },
  {
    keywords: ["contact", "Help", "help", "talk"],
    response: "Got questions or just wanna say hey? Hit up the Contact page and Kaushal will get back to you."
  },
  {
    keywords: ["notes", "Notes", "Assignments", "assignments  "],
    response: "Oh Great hit the resources section and you will get waht you want."
  },
  {
    keywords: ["navigate", "se", "How"],
    response: "Use the navbar at the top — Resources for notes, Blog for articles, Contact to reach out."
  },
  {
    keywords: ["who", "for", "audience", "users"],
    response: "If you’re a B.Tech CSE student hyped about AI and ML, you’re in the right place!"
  },
  {
    keywords: ["updates", "new", "content", "plans"],
    response: "We’re always dropping fresh notes and blogs. Keep an eye out for new stuff!"
  },
  {
    keywords: ["privacy", "data", "security"],
    response: "Your privacy’s safe here — no sneaky data stuff happening."
  },
  {
    keywords: ["feedback", "suggest", "ideas"],
    response: "Got ideas or feedback? Don’t be shy — drop a message on the Contact page!"
  },
  {
    keywords: ["why", "use", "benefits"],
    response: "Think of it like your smart buddy for AI & ML studies, making things easier and more fun."
  },

  // General tech knowledge
  {
    keywords: ["ai", "artificial intelligence"],
    response: "AI’s like teaching computers to think and learn kinda like humans — pretty cool, right?"
  },
  {
    keywords: ["machine learning", "ml"],
    response: "Machine Learning is a branch of AI where computers get smarter by learning from data without being explicitly programmed."
  },
  {
    keywords: ["difference", "ai", "ml"],
    response: "AI is the big idea of making machines smart, and ML is one way to make that happen by letting them learn from data."
  },
  {
    keywords: ["programming", "language", "learn"],
    response: "For AI & ML, Python is the MVP. Easy to learn and packed with awesome libraries!"
  },
  {
    keywords: ["deep learning", "neural network"],
    response: "Deep Learning uses layers of algorithms inspired by the human brain — that’s how things like image recognition work."
  },
  {
    keywords: ["data science"],
    response: "Data Science is all about digging into data to find cool insights and help make decisions."
  },
  {
    keywords: ["python"],
    response: "Python’s a super popular language for beginners and pros alike, especially in AI and data science."
  },
  {
    keywords: ["cloud", "cloud computing"],
    response: "Cloud computing means using powerful servers over the internet to store and process data — no need for crazy hardware at home!"
  },
  {
    keywords: ["api"],
    response: "APIs let different software talk to each other — like apps chatting behind the scenes."
  },
  {
    keywords: ["big data"],
    response: "Big Data is huge sets of info that traditional tools can’t handle — think of it as data on steroids!"
  }
];



  let matched = false;
  for (let item of responses) {
    for (let keyword of item.keywords) {
      if (query.includes(keyword)) {
        appendMessage("TechBot", item.response, "bot");
        matched = true;
        break;
      }
    }
    if (matched) break;
  }

  if (!matched) {
    appendMessage("TechBot", "Sorry, I didn't understand that. Try asking about semesters, notes, or blog posts.", "bot");
  }
}

// Ripple effect on click
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = button.querySelector(".ripple");

  ripple.style.left = `${event.offsetX}px`;
  ripple.style.top = `${event.offsetY}px`;

  ripple.classList.remove("animate");
  void ripple.offsetWidth; // trigger reflow
  ripple.classList.add("animate");
}

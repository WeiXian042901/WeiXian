/* ============================================================
   main.js: theme toggle, project filter, terminal, contact form
   No libraries. Everything is plain JS.
   ============================================================ */

/* ---------- 1. Theme toggle ---------- */
const root = document.documentElement;
const themeButton = document.getElementById("themeToggle");

// Update the button label and aria-pressed so screen readers know the state.
function showThemeState() {
  const isLight = root.getAttribute("data-theme") === "light";
  themeButton.textContent = isLight ? "Dark mode" : "Light mode";
  themeButton.setAttribute("aria-pressed", String(isLight));
}

function setTheme(name) {
  root.setAttribute("data-theme", name);
  try { localStorage.setItem("theme", name); } catch (e) { /* storage can be blocked, ignore */ }
  showThemeState();
}

themeButton.addEventListener("click", () => {
  setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
});
showThemeState();

/* ---------- 2. Project filter ---------- */
const chips = document.querySelectorAll(".chip");
const cards = document.querySelectorAll(".card");

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const wanted = chip.dataset.filter;
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    cards.forEach((card) => {
      // A card can have several tags, e.g. data-tags="security learning"
      const tags = card.dataset.tags.split(" ");
      card.hidden = !(wanted === "all" || tags.includes(wanted));
    });
  });
});

/* ---------- 3. Terminal ---------- */
const termOut = document.getElementById("termOut");
const termForm = document.getElementById("termForm");
const termIn = document.getElementById("termIn");

// The hidden puzzle. Visitors find the encoded line in `evidence`, decode it, then `submit` it.
const SECRET_FLAG = "FLAG{forensics-is-storytelling}";

const history = [];
let historyPos = 0;

// Add a line to the terminal. textContent (not innerHTML) keeps visitor input from running as HTML.
function print(text, className) {
  const line = document.createElement("div");
  if (className) line.className = className;
  line.textContent = text;
  termOut.appendChild(line);
  termOut.scrollTop = termOut.scrollHeight;
}

// Each command is a function that prints something. Add your own here.
const commands = {
  help() {
    print("Commands: about, projects, resume, contact, theme, evidence, clear");
    print("There is also a puzzle. Try: evidence");
  },
  about() { print("Third-year at SUTD. Computer systems and security. Likes forensics."); },
  projects() { print("Jumping to projects..."); location.hash = "#projects"; },
  resume() { print("Jumping to resume..."); location.hash = "#resume"; },
  contact() { print("Jumping to contact..."); location.hash = "#contact"; },
  theme() {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    setTheme(next);
    print("Theme set to " + next + ".");
  },
  clear() { termOut.textContent = ""; },
  evidence() {
    print("[09:14:02] login ok user=analyst src=10.0.0.5");
    print("[09:14:51] read /var/log/auth.log");
    print("[09:15:30] note=" + btoa(SECRET_FLAG));
    print("Something here is encoded. Try: decode <text>, then submit <flag>");
  },
  decode(argument) {
    if (!argument) return print("Usage: decode <base64 text>", "err");
    try { print(atob(argument)); }
    catch (e) { print("That is not valid base64.", "err"); }
  },
  submit(argument) {
    if (argument === SECRET_FLAG) print("Correct. You read the story in the logs. Want to talk? Type: contact");
    else print("Not the flag. Keep digging.", "err");
  },
};

termForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const raw = termIn.value.trim();
  termIn.value = "";
  if (!raw) return;

  history.push(raw);
  historyPos = history.length;
  print("$ " + raw, "cmd");

  // Easter egg: handled before the normal lookup because it has a space in it.
  if (raw.toLowerCase() === "sudo hire-me") {
    print("Permission granted. Download the CV or email me from the top of the page.");
    return;
  }

  const [name, ...rest] = raw.split(" ");
  const run = commands[name.toLowerCase()];
  if (run) run(rest.join(" ")); // pass everything after the command name as its argument
  else print("Command not found: " + name + ". Type help.", "err");
});

// Up and down arrows walk through earlier commands.
termIn.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" && historyPos > 0) {
    historyPos -= 1;
    termIn.value = history[historyPos];
    event.preventDefault();
  } else if (event.key === "ArrowDown") {
    historyPos = Math.min(historyPos + 1, history.length);
    termIn.value = history[historyPos] || "";
    event.preventDefault();
  }
});

print("Welcome. Type help to begin.");

/* ---------- 4. Contact form ---------- */
// GitHub Pages is static, so we open the visitor's email app with the message filled in.
const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const subject = "Message from " + data.get("name");
  const body = data.get("message") + "\n\nReply to: " + data.get("email");
  location.href =
    "mailto:" + contactForm.dataset.email +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(body);
});

/* ---------- 5. Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

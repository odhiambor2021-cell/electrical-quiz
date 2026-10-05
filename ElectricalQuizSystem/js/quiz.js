const params = new URLSearchParams(location.search);
const level = params.get("level") || "Beginner";
const questionText = document.getElementById("questionText");
const optionsBox = document.getElementById("options");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const timerEl = document.getElementById("timer");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const levelTitle = document.getElementById("levelTitle");

let questions = [];
let current = 0;
let score = 0;
let timer = null;
let timeLeft = 30;
let answered = false;

async function start() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    location.href = "login.html";
    return;
  }

  levelTitle.textContent = `${level} Level`;
  const { data, error } = await supabaseClient
    .from("questions")
    .select("id,question,option_a,option_b,option_c,option_d,correct_option,explanation")
    .eq("level", level)
    .eq("is_active", true)
    .limit(20);

  if (error) {
    questionText.textContent = error.message;
    return;
  }
  questions = data || [];
  if (!questions.length) {
    questionText.textContent = "No questions have been added for this level yet.";
    return;
  }
  showQuestion();
}

function showQuestion() {
  answered = false;
  clearInterval(timer);
  timeLeft = 30;
  timerEl.textContent = timeLeft;
  nextBtn.classList.add("hidden");
  feedback.textContent = "";

  const q = questions[current];
  questionText.textContent = q.question;
  progressText.textContent = `Question ${current + 1} of ${questions.length}`;
  progressBar.style.width = `${((current + 1) / questions.length) * 100}%`;

  const opts = [
    ["A", q.option_a], ["B", q.option_b],
    ["C", q.option_c], ["D", q.option_d]
  ];

  optionsBox.innerHTML = "";
  opts.forEach(([letter, text]) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = `${letter}. ${text}`;
    btn.dataset.option = letter;
    btn.onclick = () => choose(btn, letter, q);
    optionsBox.appendChild(btn);
  });

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      choose(null, null, q);
    }
  }, 1000);
}

function choose(button, selected, q) {
  if (answered) return;
  answered = true;
  clearInterval(timer);

  document.querySelectorAll(".option").forEach(b => b.disabled = true);
  const correct = q.correct_option;

  document.querySelectorAll(".option").forEach(b => {
    if (b.dataset.option === correct) b.classList.add("correct");
  });

  if (selected === correct) {
    score++;
    if (button) button.classList.add("correct");
    feedback.textContent = "Correct! " + (q.explanation || "");
  } else {
    if (button) button.classList.add("wrong");
    feedback.textContent = "The correct answer is " + correct + ". " + (q.explanation || "");
  }

  nextBtn.classList.remove("hidden");
}

nextBtn.addEventListener("click", async () => {
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    await finishQuiz();
  }
});

async function finishQuiz() {
  clearInterval(timer);
  document.querySelector(".quiz-head").parentElement.classList.add("hidden");
  const resultCard = document.getElementById("resultCard");
  resultCard.classList.remove("hidden");

  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

  const { data: { user } } = await supabaseClient.auth.getUser();
  const { error } = await supabaseClient.from("quiz_attempts").insert({
    user_id: user.id,
    level,
    score,
    total_questions: total,
    percentage
  });

  if (error) {
    document.getElementById("resultText").innerHTML =
      `<p>Score: <strong>${score}/${total}</strong> (${percentage}%)</p><p>Result could not be saved: ${error.message}</p>`;
    return;
  }

  let message = percentage >= 80 ? "Excellent work!" :
                percentage >= 60 ? "Good work. Keep practicing!" :
                "Keep studying and try again.";

  document.getElementById("resultText").innerHTML =
    `<p class="big-score">${percentage}%</p>
     <p>You scored <strong>${score}</strong> out of <strong>${total}</strong>.</p>
     <p>${message}</p>`;
}

start();

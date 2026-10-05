async function loadDashboard() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const { data: profile } = await supabaseClient
    .from("profiles")
    .select("full_name, admission_number, role")
    .eq("id", user.id)
    .single();

  document.getElementById("welcome").textContent =
    `Welcome, ${profile?.full_name || "Student"}`;
  document.getElementById("studentInfo").textContent =
    `${profile?.admission_number || ""} • ${user.email}`;

  const { data: results, error } = await supabaseClient
    .from("quiz_attempts")
    .select("level, score, total_questions, percentage, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const box = document.getElementById("myResults");
  if (error) {
    box.textContent = error.message;
    return;
  }
  if (!results.length) {
    box.innerHTML = "<p>No quiz attempts yet.</p>";
    return;
  }

  box.innerHTML = results.map(r =>
    `<p><strong>${r.level}</strong> — ${r.score}/${r.total_questions} (${Number(r.percentage).toFixed(0)}%)</p>`
  ).join("");
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
});

loadDashboard();

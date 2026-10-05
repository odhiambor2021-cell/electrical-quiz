async function loadAdmin() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    location.href = "login.html";
    return;
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("role,full_name")
    .eq("id", user.id)
    .single();

  if (profileError || !["admin", "teacher"].includes(profile?.role)) {
    document.body.innerHTML = "<div class='container center'><div class='card'><h1>Access denied</h1><p>This page is for teachers and administrators.</p><a class='btn' href='dashboard.html'>Student Dashboard</a></div></div>";
    return;
  }

  const { data: students } = await supabaseClient
    .from("profiles")
    .select("id")
    .eq("role", "student");

  const { data: attempts, error } = await supabaseClient
    .from("quiz_attempts")
    .select("user_id, level, score, total_questions, percentage, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  document.getElementById("studentCount").textContent = students?.length || 0;
  document.getElementById("attemptCount").textContent = attempts?.length || 0;

  const average = attempts?.length
    ? attempts.reduce((sum, a) => sum + Number(a.percentage), 0) / attempts.length
    : 0;
  document.getElementById("averageScore").textContent = `${average.toFixed(0)}%`;

  const body = document.getElementById("resultsBody");
  if (error) {
    body.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
    return;
  }

  body.innerHTML = (attempts || []).map(a => `
    <tr>
      <td>${escapeHtml(a.profiles?.full_name || "Student")}</td>
      <td>${escapeHtml(a.level)}</td>
      <td>${a.score}/${a.total_questions}</td>
      <td>${Number(a.percentage).toFixed(0)}%</td>
      <td>${new Date(a.created_at).toLocaleString()}</td>
    </tr>
  `).join("");
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  location.href = "login.html";
});

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])
  );
}

loadAdmin();

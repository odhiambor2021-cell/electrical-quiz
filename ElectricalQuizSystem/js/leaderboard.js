async function loadLeaderboard() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    location.href = "login.html";
    return;
  }

  const { data, error } = await supabaseClient
    .from("leaderboard")
    .select("*")
    .limit(100);

  const body = document.getElementById("leaderboardBody");
  if (error) {
    body.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
    return;
  }

  if (!data.length) {
    body.innerHTML = '<tr><td colspan="5">No scores yet.</td></tr>';
    return;
  }

  body.innerHTML = data.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapeHtml(r.full_name)}</td>
      <td>${escapeHtml(r.level)}</td>
      <td>${Number(r.percentage).toFixed(0)}%</td>
      <td>${new Date(r.created_at).toLocaleDateString()}</td>
    </tr>
  `).join("");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])
  );
}

loadLeaderboard();

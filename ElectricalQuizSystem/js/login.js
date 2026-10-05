const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "Signing in...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email, password
  });

  if (error) {
    message.textContent = error.message;
    return;
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    message.textContent = profileError.message;
    return;
  }

  if (profile.role === "admin" || profile.role === "teacher") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "dashboard.html";
  }
});

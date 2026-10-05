const form = document.getElementById("registerForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fullName = document.getElementById("fullName").value.trim();
  const admissionNumber = document.getElementById("admissionNumber").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    message.textContent = "Passwords do not match.";
    return;
  }
  message.textContent = "Creating account...";

  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, admission_number: admissionNumber },
      emailRedirectTo: window.location.origin + "/login.html"
    }
  });

  if (error) {
    message.textContent = error.message;
    return;
  }
  message.textContent = "Account created. Check your email if email confirmation is enabled, then login.";
  form.reset();
});

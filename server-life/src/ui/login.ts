import { authenticate, rosterOptions, setActiveProfile } from "../engine/auth";
import { finalizeInterruptedSessions } from "../storage/profile";

export function Login(root: HTMLElement, onSuccess: () => void): void {
  const options = rosterOptions().map((entry) => `<option value="${entry.kode}">${entry.kode}</option>`).join("");
  root.innerHTML = `<main class="app-shell"><section class="briefing-screen"><div class="briefing-card login-card"><span class="briefing-step">SERVER LIFE · PRESENSI</span><h1>Masuk ke sistem</h1><p>Pilih kode presensi dan masukkan token 4 digit.</p><label for="attendance-code">Kode Presensi</label><select id="attendance-code">${options}</select><div class="token-boxes">${[0, 1, 2, 3].map((index) => `<input data-token="${index}" inputmode="numeric" maxlength="1" aria-label="Digit token ${index + 1}">`).join("")}</div><p class="login-helper">Token ada di kartu meja yang dibagikan guru.</p><p class="login-error" data-error hidden>Kode atau token salah.</p><button class="primary-button" data-login>Masuk</button></div></section></main>`;
  const inputs = [...root.querySelectorAll<HTMLInputElement>("[data-token]")];
  inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "").slice(0, 1);
      if (input.value && inputs[index + 1]) inputs[index + 1].focus();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && !input.value && inputs[index - 1]) inputs[index - 1].focus();
    });
    input.addEventListener("paste", (event) => {
      const value = event.clipboardData?.getData("text").replace(/\D/g, "").slice(0, 4) ?? "";
      if (!value) return;
      event.preventDefault();
      inputs.forEach((field, fieldIndex) => { field.value = value[fieldIndex] ?? ""; });
      inputs[Math.min(value.length, inputs.length) - 1]?.focus();
    });
  });
  root.querySelector<HTMLButtonElement>("[data-login]")?.addEventListener("click", async () => {
    const code = root.querySelector<HTMLSelectElement>("#attendance-code")?.value ?? "";
    const token = inputs.map((input) => input.value).join("");
    const profile = await authenticate(code, token);
    const error = root.querySelector<HTMLElement>("[data-error]");
    if (!profile) {
      if (error) error.hidden = false;
      return;
    }
    setActiveProfile(profile);
    finalizeInterruptedSessions(profile);
    onSuccess();
  });
}

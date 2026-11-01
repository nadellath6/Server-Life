import { Home, attachHomeListeners } from "./home";

export type Route = "login" | "tutorial" | "home" | "briefing" | "arena" | "report" | "result";

const routes = new Set<Route>(["login", "tutorial", "home", "briefing", "arena", "report", "result"]);

function currentRoute(): Route {
  const value = window.location.hash.slice(1) as Route;
  return routes.has(value) ? value : "home";
}

function render(route: Route, root: HTMLElement): void {
  if (route === "home") {
    root.innerHTML = `<main class="app-shell"><div class="noise"></div>${Home()}</main>`;
    attachHomeListeners(root, navigate);
    return;
  }
  root.innerHTML = `<main class="app-shell"><div class="noise"></div><section class="briefing-screen"><div class="briefing-card"><span class="briefing-step">SERVER LIFE</span><h1>${route.toUpperCase()}</h1><p>Coming soon.</p><button class="primary-button" data-route="home">Kembali ke beranda</button></div></section></main>`;
  root.querySelector<HTMLElement>("[data-route]")?.addEventListener("click", () => navigate("home"));
}

export function navigate(route: string): void {
  const next = routes.has(route as Route) ? route : "home";
  if (window.location.hash !== `#${next}`) {
    window.location.hash = next;
  } else {
    const root = document.querySelector<HTMLElement>("#app");
    if (root) render(next as Route, root);
  }
}

export function startRouter(root: HTMLElement): void {
  window.addEventListener("hashchange", () => render(currentRoute(), root));
  if (!window.location.hash) {
    window.location.hash = "home";
  } else {
    render(currentRoute(), root);
  }
}

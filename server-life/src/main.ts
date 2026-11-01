import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/screens.css";
import { startRouter } from "./ui/router";

const root = document.querySelector<HTMLElement>("#app");

if (!root) {
  throw new Error("App root element was not found.");
}

startRouter(root);

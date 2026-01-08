import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress errors from external scripts (like Spaceremit SDK)
window.addEventListener('error', (event) => {
  // Check if error is from external script (spaceremit)
  if (event.filename?.includes('spaceremit') || 
      event.message?.includes('spaceremit') ||
      !event.filename) {
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  // Suppress unhandled promise rejections from external scripts
  const reason = event.reason?.toString() || '';
  if (reason.includes('spaceremit') || reason.includes('SP_')) {
    event.preventDefault();
    return true;
  }
});

createRoot(document.getElementById("root")!).render(<App />);

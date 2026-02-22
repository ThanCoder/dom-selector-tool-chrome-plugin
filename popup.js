function createRootApp() {
  // createDomContentExtractor();
  createTabs()
}

// theme dark,light
function checkDarkMode() {
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.body.classList.toggle("dark", isDarkMode);
  console.log(`isDarkMode: ${isDarkMode}`);
}

// Popup ပွင့်လာတာနဲ့ Load လုပ်မယ်
document.addEventListener("DOMContentLoaded", createRootApp);

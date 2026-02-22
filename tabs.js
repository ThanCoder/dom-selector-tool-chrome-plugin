const tabRoutes = [
  {
    id: 1,
    title: "Home",
  },
  {
    id: 2,
    title: "Download File",
  },
];
var currentTabIndex = 1;

function createTabs() {
  const rootEle = document.querySelector("#root-app");
  rootEle.innerHTML = `
<div class="tabs">
        <div class="tab-header">
        ${tabRoutes.map((e) => `<div class="tab-btn" tabindex="${e.id}">${e.title}</div>`).join("\n")}
        </div>
        <div class="tab-content"></div>
      </div>
      `;

  createHomeTab();
  //   tab btn
  const tabs = document.querySelectorAll(".tab-btn");
  //   tabs.forEach((t) => t.classList.remove("active"));

  // init tab
  tabs[0].classList.add("active");

  tabs.forEach((ele) => {
    ele.addEventListener("click", () => {
      const index = ele.attributes["tabindex"].value;
      currentTabIndex = index;
      // အရင် active တွေ အားလုံး remove
      tabs.forEach((t) => t.classList.remove("active"));

      if (index == 1) {
        createHomeTab();
        ele.classList.add("active");
      } else if (index == 2) {
        ele.classList.add("active");
        createDownloadFileTab();
      }
    });
  });
}

function createHomeTab() {
  createDomContentExtractor();
}

function createDownloadFileTab() {
  const tabContent = document.querySelector(".tab-content");
  tabContent.innerHTML = `i am download file tab`;
}

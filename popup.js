async function init() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // popup.html scoped
  //new box

  // Input Box တစ်ခုချင်းစီကနေ data တွေကို စုစည်းမယ်
  const inputBoxes = document.querySelectorAll(".input-box");
  const queries = Array.from(inputBoxes).map((box) => {
    return {
      index: box.querySelector(".selector-index").value,
      query: box.querySelector(".selector").value,
      isActive: box.querySelector(".selector-checkbox").checked, // Checked ဖြစ်မဖြစ် စစ်တာ
      attr: box.querySelector(".attr-select").value,
    };
  });
  const config = {
    queries,
    actions: {
      autoNextQuery: {
        isActive: document.querySelector(".auto-next-selector-checkbox")
          .checked,
        attr: document.querySelector(".auto-next-selector-attr").value,
        selector: document.querySelector(".auto-next-selector-query").value,
      },
    },
  };

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      args: [config],
      func: (config) => {
        // ဒီနေရာမှာ မိမိလိုချင်တဲ့ DOM element ကို select လုပ်ပါ
        let results = [];
        let data = {};
        // elements selector from textarea
        for (const val of config.queries) {
          if (!val.isActive) continue;
          const eles = document.querySelectorAll(val.query);
          if (val.index > eles.length) continue;

          const targetEle = eles[val.index];

          if (!targetEle) continue;
          // စာသားကို Array ထဲ ထည့်မယ်

          if (val.attr === "text") results.push(targetEle.innerText.trim());
          else if (val.attr === "html")
            results.push(targetEle.innerHTML.trim());
          else if (val.attr === "src") results.push(targetEle.src);
          else if (val.attr === "href") results.push(targetEle.href);
          else if (val.attr === "value") results.push(targetEle.value);
        }
        data["data"] = results.join("\n\n");

        // action query
        const autoNextQuery = config.actions.autoNextQuery;
        if (autoNextQuery.isActive) {
          const ele = document.querySelector(autoNextQuery["selector"]);
          if (ele) {
            if (autoNextQuery["attr"] == "href") {
              data["autoNextQueryResult"] = ele.href;
            }
            if (autoNextQuery["src"] == "href") {
              data["autoNextQueryResult"] = ele.src;
            }
          }
        }
        // console.log(data);

        return data;
      },
    },
    (injectionResults) => {
      for (const frameResult of injectionResults) {
        const textarea = document.getElementById("resultArea");
        textarea.value = frameResult.result.data;
        if (frameResult.result) {
          textarea.style.height = "200px";
          document.getElementById("copyText").style.display = "block";
          // saveToStorage();
        } else {
          textarea.style.height = "100px";
          document.getElementById("copyText").style.display = "none";
        }
        // show action result
        if (frameResult.result["autoNextQueryResult"]) {
          document.querySelector(".auto-next-selector-result").value =
            frameResult.result["autoNextQueryResult"];
        }
      }
    },
  );
}

//remove input
// inputContainer တစ်ခုလုံးကို Listen လုပ်ထားခြင်း (ပိုထိရောက်ပါတယ်)
document.getElementById("inputContainer").addEventListener("click", (event) => {
  // နှိပ်လိုက်တဲ့အရာက selector-del-btn ဟုတ်မဟုတ် စစ်မယ်
  if (event.target.classList.contains("selector-del-btn")) {
    // ခလုတ်ရဲ့ မိဘဖြစ်တဲ့ .input-box ကို ရှာပြီး ဖျက်ပစ်မယ်
    const inputBox = event.target.closest(".input-box");

    if (inputBox) {
      inputBox.remove();

      // ဖျက်ပြီးရင် localStorage မှာလည်း data ပြန်သိမ်းပေးရပါမယ်
      saveToStorage();
    }
  }
});

async function copyTextarea() {
  const ele = document.getElementById("resultArea");
  const textToCopy = ele.value;

  if (!textToCopy) {
    alert("Copy လုပ်ဖို့ စာသားမရှိပါဘူး။");
    return;
  }

  try {
    // Clipboard ထဲသို့ ကူးထည့်ခြင်း
    await navigator.clipboard.writeText(textToCopy);

    // User သိအောင် ခလုတ်စာသားလေး ခဏပြောင်းပေးမယ် (User Experience)
    const copyBtn = document.getElementById("copyText");
    const originalText = copyBtn.innerText;
    copyBtn.innerText = "Copied!";

    setTimeout(() => {
      copyBtn.innerText = originalText;
    }, 2000);
  } catch (err) {
    console.error("Copy ကူးလို့ မရပါဘူး:", err);

    // အဟောင်းနည်းလမ်း (Fallback) - တစ်ချို့ Browser တွေအတွက်
    ele.select();
    document.execCommand("copy");
    alert("Copied using fallback!");
  }
  callAutoAction();
}

// Data တွေကို localStorage ထဲ သိမ်းမယ့် function
function saveToStorage() {
  const inputBoxes = document.querySelectorAll(".input-box");
  const config = Array.from(inputBoxes).map((box) => {
    return {
      index: box.querySelector(".selector-index").value,
      query: box.querySelector(".selector").value,
      isActive: box.querySelector(".selector-checkbox").checked, // Checked ဖြစ်မဖြစ် စစ်တာ
      attr: box.querySelector(".attr-select").value,
    };
  });
  // console.log(config);
  localStorage.setItem("chrome-dom-selector-tool-data", JSON.stringify(config));

  // action
  const actionData = {
    copiedAutoClose: document.querySelector("#copied-auto-close-checkbox")
      .checked,
    autoNextCheckBox: document.querySelector(".auto-next-selector-checkbox")
      .checked,
    autoNextUrlQuery: document.querySelector(".auto-next-selector-query").value,
    autoNextUrlQueryAttr: document.querySelector(".auto-next-selector-attr")
      .value,
  };
  localStorage.setItem(
    "chrome-dom-selector-tool-action-data",
    JSON.stringify(actionData),
  );
  console.log(`Save Action: ${JSON.stringify(actionData)}`);
}

// load storage
function loadFromStorage() {
  const savedData = localStorage.getItem("chrome-dom-selector-tool-data");
  const actionJson = localStorage.getItem(
    "chrome-dom-selector-tool-action-data",
  );
  const actionData = JSON.parse(actionJson);
  // action
  if (actionData) {
    try {
      if (actionData["copiedAutoClose"]) {
        document.querySelector("#copied-auto-close-checkbox").checked =
          actionData["copiedAutoClose"] ? true : false;
      }
      //#next_chap
      if (actionData["autoNextCheckBox"]) {
        document.querySelector(".auto-next-selector-checkbox").checked =
          actionData["autoNextCheckBox"] ? true : false;
      }
      if (actionData["autoNextUrlQuery"]) {
        document.querySelector(".auto-next-selector-query").value =
          actionData["autoNextUrlQuery"];
      }
      if (actionData["autoNextUrlQueryAttr"]) {
        const select = document.querySelector(".auto-next-selector-attr");
        select.value = actionData["autoNextUrlQueryAttr"]; // "href" လည်းထည့်လို့ရ
      }

      console.log(`Load Action: ${actionJson}`);
    } catch (error) {
      console.error(error);
    }
  }

  if (!savedData) return;

  const config = JSON.parse(savedData);

  const container = document.getElementById("inputContainer");

  // လက်ရှိရှိနေတဲ့ input-box တွေကို အကုန်ဖျက်ပြီး အသစ်ပြန်တည်ဆောက်မယ် (သို့မဟုတ် ပထမတစ်ခုမှာ ပြန်ဖြည့်မယ်)
  container.innerHTML = ""; // Container ကို ရှင်းထုတ်လိုက်တာ
  // console.log(config);

  config.forEach((item) => {
    const box = document.createElement("div");
    box.className = "input-box";
    box.innerHTML = `
      <input type="checkbox" class="selector-checkbox" ${item.isActive ? "checked" : ""} />
      <input type="number" class="selector-index" value="${item.index}" min="0" />
       <select class="attr-select">
        <option value="text" ${item.attr === "text" ? "selected" : ""}>Text</option>
        <option value="html" ${item.attr === "html" ? "selected" : ""}>HTML</option>
        <option value="src" ${item.attr === "src" ? "selected" : ""}>src</option>
        <option value="href" ${item.attr === "href" ? "selected" : ""}>href</option>
        <option value="value" ${item.attr === "value" ? "selected" : ""}>Value</option>
    </select>
      
      <input type="text" class="selector" value="${item.query}" placeholder="e.g. .title or #main" />
      <button class="selector-del-btn">X</button>
    `;
    container.appendChild(box);
  });

  init();
}

function createNewInput(item, attrVal = "text") {
  const container = document.getElementById("inputContainer");
  const box = document.createElement("div");
  box.className = "input-box";
  box.innerHTML = `
      <input type="checkbox" class="selector-checkbox" ${item.isActive ? "checked" : ""} />
      <input type="number" class="selector-index" value="${item.index}" min="0" />
       <select class="attr-select">
        <option value="text" ${attrVal === "text" ? "selected" : ""}>Text</option>
        <option value="html" ${attrVal === "html" ? "selected" : ""}>HTML</option>
        <option value="src" ${attrVal === "src" ? "selected" : ""}>src</option>
        <option value="href" ${attrVal === "href" ? "selected" : ""}>href</option>
        <option value="value" ${attrVal === "value" ? "selected" : ""}>Value</option>
        </select>
      
      <input type="text" class="selector" value="${item.query}" placeholder="e.g. .title or #main" />
      <button class="selector-del-btn">X</button>
    `;
  container.appendChild(box);
}

// auto action
async function callAutoAction() {
  // auto next url
  if (document.querySelector(".auto-next-selector-checkbox").checked) {
    const url = document.querySelector(".auto-next-selector-result").value;
    if (url.length == 0) return;
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.update(tab.id, { url });
  }

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: "Copied!",
    message: "Clipboard Copied",
  });

  // box close
  if (document.querySelector("#copied-auto-close-checkbox").checked) {
    setTimeout(() => {
      window.close();
    }, 1200); // toast ပြသထားပြီးမှ ပိတ်
  }
}

// new input
document.getElementById("addMore").addEventListener("click", () => {
  createNewInput({ index: 0, query: "", isActive: true });
});

// Event Delegation သုံးပြီး input ပြောင်းတိုင်း သိမ်းမယ်
document
  .getElementById("inputContainer")
  .addEventListener("input", saveToStorage);
document
  .querySelector(".auto-action-group")
  .addEventListener("click", saveToStorage);

document.getElementById("extractBtn").addEventListener("click", init);
// copy
document.getElementById("copyText").addEventListener("click", copyTextarea);

// Popup ပွင့်လာတာနဲ့ Load လုပ်မယ်
document.addEventListener("DOMContentLoaded", loadFromStorage);

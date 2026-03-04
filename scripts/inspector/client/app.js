// ============================================================
// DOM References
// ============================================================
const currentUrl = document.getElementById("currentUrl");
const targetFrame = document.getElementById("targetFrame");
const selectorOutput = document.getElementById("selectorOutput");
const elementInfo = document.getElementById("elementInfo");
const codeLog = document.getElementById("codeLog");
const inspectMode = document.getElementById("inspectMode");
const recordMode = document.getElementById("recordMode");
const copyBtn = document.getElementById("copyBtn");
const copyScriptBtn = document.getElementById("copyScriptBtn");
const recordedCode = document.getElementById("recordedCode");
const emptyState = document.getElementById("emptyState");
const infoTag = document.getElementById("infoTag");
const infoId = document.getElementById("infoId");
const infoTestId = document.getElementById("infoTestId");
const infoClass = document.getElementById("infoClass");
const infoText = document.getElementById("infoText");
const infoType = document.getElementById("infoType");
const infoName = document.getElementById("infoName");
const recordedScriptPanel = document.getElementById("recordedScriptPanel");

// ============================================================
// State
// ============================================================
let currentSelector = "";
let isInspectMode = true;
let isRecording = false;

// ============================================================
// Initialization
// ============================================================
// The MITM proxy injects __INSPECTOR_TARGET__ into the page.
// If it's present, show the target URL and hide the empty state
// (iframe already loads "/" which the proxy serves as the real target).
const inspectorTarget = window.__INSPECTOR_TARGET__;
if (inspectorTarget) {
  currentUrl.value = inspectorTarget;
  emptyState.classList.add("hidden");
  targetFrame.classList.add("loaded");
  log(`Inspector connected to: ${inspectorTarget}`);
} else {
  // Fallback: if loaded outside of MITM proxy context (e.g. direct /proxy?url= mode)
  const urlParams = new URLSearchParams(window.location.search);
  const initialUrl = urlParams.get("url");
  if (initialUrl) {
    currentUrl.value = initialUrl;
    loadUrl(initialUrl);
  }
}

// ============================================================
// Toggle Controls
// ============================================================
inspectMode.addEventListener("click", () => {
  isInspectMode = !isInspectMode;
  inspectMode.setAttribute("aria-checked", isInspectMode);

  if (isInspectMode && isRecording) {
    isRecording = false;
    recordMode.setAttribute("aria-checked", false);
    recordedScriptPanel.classList.add("hidden");
  }
});

recordMode.addEventListener("click", () => {
  isRecording = !isRecording;
  recordMode.setAttribute("aria-checked", isRecording);

  if (isRecording) {
    recordedScriptPanel.classList.remove("hidden");
  } else {
    recordedScriptPanel.classList.add("hidden");
  }

  if (isRecording && isInspectMode) {
    isInspectMode = false;
    inspectMode.setAttribute("aria-checked", false);
  }
});

// ============================================================
// Copy Buttons
// ============================================================
copyBtn.addEventListener("click", () => {
  if (currentSelector) {
    navigator.clipboard.writeText(currentSelector);
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span class="material-icons-outlined">check</span>';
    setTimeout(() => (copyBtn.innerHTML = originalText), 1000);
  }
});

copyScriptBtn.addEventListener("click", () => {
  if (recordedCode.textContent) {
    navigator.clipboard.writeText(recordedCode.textContent);
    const originalText = copyScriptBtn.innerHTML;
    copyScriptBtn.innerHTML =
      '<span class="material-icons-outlined">check</span>';
    setTimeout(() => (copyScriptBtn.innerHTML = originalText), 1000);
  }
});

// ============================================================
// Sidebar Resize
// ============================================================
const resizeHandle = document.querySelector(".resize-handle");
const sidebar = document.querySelector(".sidebar");
let isResizing = false;

resizeHandle.addEventListener("mousedown", (e) => {
  isResizing = true;
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  const newWidth = e.clientX;
  if (newWidth >= 250 && newWidth <= 600) {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${newWidth}px`,
    );
  }
});

document.addEventListener("mouseup", () => {
  if (isResizing) {
    isResizing = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }
});

// ============================================================
// URL Loading
// ============================================================
function loadUrl(url) {
  if (!url.startsWith("http")) {
    url = "https://" + url;
  }
  emptyState.classList.add("hidden");
  targetFrame.classList.add("loaded");

  if (inspectorTarget) {
    // MITM mode: set the FULL URL — the proxy transparently handles any domain,
    // so external URLs (e.g. dev-fam.tagsamurai.com) work exactly like internal ones.
    targetFrame.src = url;
  } else {
    // Legacy /proxy?url= mode
    targetFrame.src = `/proxy?url=${encodeURIComponent(url)}`;
  }

  currentUrl.value = url;
  log(`Loading: ${url}`);
}

// ============================================================
// Iframe Load Handler
// ============================================================
targetFrame.onload = () => {
  log("Target loaded. Injecting inspector script...");
  injectInspectorScript();
  updateCurrentUrl();
  startUrlMonitoring();
};

// ============================================================
// URL Monitoring (SPA navigation tracking)
// ============================================================
let lastIframeUrl = "";
function startUrlMonitoring() {
  setInterval(() => {
    try {
      const iframeDoc =
        targetFrame.contentDocument || targetFrame.contentWindow.document;
      const iframeUrl = iframeDoc.location.href;

      if (iframeUrl !== lastIframeUrl && !iframeUrl.includes("about:blank")) {
        lastIframeUrl = iframeUrl;
        updateCurrentUrl();
      }
    } catch (e) {
      // Cross-origin access error — ignore
    }
  }, 500);
}

function updateCurrentUrl() {
  try {
    const iframeDoc =
      targetFrame.contentDocument || targetFrame.contentWindow.document;

    // Under MITM proxy: the iframe is on the same origin as the real site.
    // We can read its full URL directly.
    const iframeFullUrl = iframeDoc.location.href;
    if (iframeFullUrl && !iframeFullUrl.includes("about:blank")) {
      currentUrl.value = iframeFullUrl;
      return;
    }
  } catch (e) {
    // Cross-origin — keep current value, or build URL from target base
    if (inspectorTarget) {
      currentUrl.value = inspectorTarget;
    }
  }
}

// ============================================================
// Inspector Script Injection
// ============================================================
function injectInspectorScript() {
  try {
    const doc = targetFrame.contentDocument;
    const win = targetFrame.contentWindow;

    if (!doc) {
      log(
        "Error: Cannot access iframe content. Ensure --disable-web-security is active.",
      );
      return;
    }

    // Inject highlight styles
    const style = doc.createElement("style");
    style.textContent = `
            .wdio-inspector-hover {
                outline: 2px solid #3b82f6 !important;
                cursor: crosshair !important;
                background-color: rgba(59, 130, 246, 0.1) !important;
            }
        `;
    doc.head.appendChild(style);

    // Mouseover: highlight + show element info
    doc.body.addEventListener("mouseover", (e) => {
      if (!isInspectMode) return;
      e.stopPropagation();

      const prev = doc.querySelectorAll(".wdio-inspector-hover");
      prev.forEach((el) => el.classList.remove("wdio-inspector-hover"));

      e.target.classList.add("wdio-inspector-hover");

      const info = {
        tagName: e.target.tagName.toLowerCase(),
        id: e.target.id,
        testId: e.target.getAttribute("data-test-id"),
        className: e.target.className,
        text: e.target.innerText?.substring(0, 100) || "",
        type: e.target.type || "",
        name: e.target.name || "",
      };
      updateInfo(info);
    });

    // Mouseout: remove highlight
    doc.body.addEventListener("mouseout", (e) => {
      if (!isInspectMode) return;
      e.target.classList.remove("wdio-inspector-hover");
    });

    // Click: select element or record
    doc.body.addEventListener("click", (e) => {
      const link = e.target.closest("a");

      if (link && link.href) {
        // INSPECT MODE: show selector, block navigation
        if (isInspectMode) {
          e.preventDefault();
          e.stopPropagation();
          const selector = generateSelector(link);
          currentSelector = selector;
          selectorOutput.textContent = `$('${selector}')`;
          log(`Selected: ${selector}`);
          link.classList.remove("wdio-inspector-hover");
          return;
        }

        // RECORD MODE: record the click, then let browser navigate naturally.
        // In MITM mode the proxy handles all domains transparently — no need to
        // intercept the navigation; the URL monitoring interval will pick it up.
        if (isRecording) {
          const selector = generateSelector(link);
          addToRecordedScript(`await $('${selector}').click();`);
          // Do NOT preventDefault — let the browser follow the link normally
          return;
        }

        // NORMAL MODE: let the browser navigate naturally (proxy handles all domains)
        return;
      }

      // Non-link clicks
      if (!isInspectMode && !isRecording) return;

      if (isRecording) {
        const selector = generateSelector(e.target);
        addToRecordedScript(`await $('${selector}').click();`);
        return;
      }

      if (isInspectMode) {
        e.preventDefault();
        e.stopPropagation();
        const selector = generateSelector(e.target);
        currentSelector = selector;
        selectorOutput.textContent = `$('${selector}')`;
        log(`Selected: ${selector}`);
        e.target.classList.remove("wdio-inspector-hover");
      }
    });

    // Change: record input values
    doc.body.addEventListener("change", (e) => {
      if (!isRecording) return;
      const selector = generateSelector(e.target);
      const value = e.target.value.replace(/'/g, "\\'");
      addToRecordedScript(`await $('${selector}').setValue('${value}');`);
    });

    log("Inspector script injected successfully.");
  } catch (e) {
    log(`Injection Failed: ${e.message}`);
    log("Make sure Chrome was launched with --disable-web-security");
  }
}

// ============================================================
// Selector Generation
// ============================================================
function generateSelector(el) {
  // 1. data-test-id (highest priority)
  const testId = el.getAttribute("data-test-id");
  if (testId) return `~${testId}`;

  // 2. id
  if (el.id) return `#${el.id}`;

  // 3. className
  if (el.className && typeof el.className === "string") {
    const classes = el.className
      .split(" ")
      .filter((c) => c !== "wdio-inspector-hover" && c.trim() !== "");
    if (classes.length > 0) {
      const escapedClass = CSS.escape(classes[0]);
      return `.${escapedClass}`;
    }
  }

  // 4. tag + text for interactive elements
  if (el.tagName === "BUTTON" || el.tagName === "A") {
    const text = el.innerText?.trim();
    if (text) return `${el.tagName.toLowerCase()}=${text}`;
  }

  // 5. fallback: tag name
  return el.tagName.toLowerCase();
}

// ============================================================
// UI Helpers
// ============================================================
function updateInfo(info) {
  infoTag.textContent = `<${info.tagName}>`;
  infoId.textContent = info.id || "-";
  infoTestId.textContent = info.testId || "-";

  const classText =
    typeof info.className === "string"
      ? info.className.replace("wdio-inspector-hover", "").trim() || "-"
      : "-";
  document.getElementById("infoClass").textContent = classText;
  document.getElementById("infoText").textContent = info.text || "-";
  document.getElementById("infoType").textContent = info.type || "-";
  document.getElementById("infoName").textContent = info.name || "-";
}

function log(msg) {
  const div = document.createElement("div");
  div.textContent = `> ${msg}`;
  codeLog.appendChild(div);
  codeLog.scrollTop = codeLog.scrollHeight;
}

function addToRecordedScript(line) {
  recordedCode.textContent += line + "\n";
  recordedCode.scrollTop = recordedCode.scrollHeight;
}

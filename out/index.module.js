// src/lib/ericchase/Core_Console_Error.ts
function Core_Console_Error(...items) {
  console["error"](...items);
}

// src/lib/ericchase/WebPlatform_DOM_ReadyState_Callback.ts
async function Async_WebPlatform_DOM_ReadyState_Callback(config) {
  async function DOMContentLoaded() {
    removeEventListener("DOMContentLoaded", DOMContentLoaded);
    await config.DOMContentLoaded?.();
  }
  async function load() {
    removeEventListener("load", load);
    await config.load?.();
  }
  switch (document.readyState) {
    case "loading":
      if (config.DOMContentLoaded !== undefined) {
        addEventListener("DOMContentLoaded", DOMContentLoaded);
      }
      if (config.load !== undefined) {
        addEventListener("load", load);
      }
      break;
    case "interactive":
      await config.DOMContentLoaded?.();
      if (config.load !== undefined) {
        addEventListener("load", load);
      }
      break;
    case "complete":
      await config.DOMContentLoaded?.();
      await config.load?.();
      break;
  }
}

// src/lib/ericchase/WebPlatform_Node_Reference_Class.ts
class Class_WebPlatform_Node_Reference_Class {
  node;
  constructor(node) {
    this.node = node;
  }
  as(constructor_ref) {
    if (this.node instanceof constructor_ref) {
      return this.node;
    }
    throw new TypeError(`Reference node ${this.node} is not ${constructor_ref}`);
  }
  is(constructor_ref) {
    return this.node instanceof constructor_ref;
  }
  passAs(constructor_ref, fn) {
    if (this.node instanceof constructor_ref) {
      fn(this.node);
    }
  }
  tryAs(constructor_ref) {
    if (this.node instanceof constructor_ref) {
      return this.node;
    }
  }
  get classList() {
    return this.as(HTMLElement).classList;
  }
  get className() {
    return this.as(HTMLElement).className;
  }
  get style() {
    return this.as(HTMLElement).style;
  }
  getAttribute(qualifiedName) {
    return this.as(HTMLElement).getAttribute(qualifiedName);
  }
  setAttribute(qualifiedName, value) {
    this.as(HTMLElement).setAttribute(qualifiedName, value);
  }
  getStyleProperty(property) {
    return this.as(HTMLElement).style.getPropertyValue(property);
  }
  setStyleProperty(property, value, priority) {
    this.as(HTMLElement).style.setProperty(property, value, priority);
  }
}
function WebPlatform_Node_Reference_Class(node) {
  return new Class_WebPlatform_Node_Reference_Class(node);
}
function WebPlatform_Node_QuerySelector(selector) {
  return WebPlatform_Node_Reference_Class(document.querySelector(selector));
}

// src/lib/server/constants.ts
var SERVERHOST = CheckENV() ?? CheckCurrentScript() ?? CheckMetaUrl() ?? CheckError() ?? window.location.host;
function CheckENV() {
  try {
    return process.env.SERVERHOST;
  } catch {}
}
function CheckCurrentScript() {
  try {
    return new URL(document.currentScript.src).host;
  } catch {}
}
function CheckMetaUrl() {
  try {
    return new URL(import.meta.url).host;
  } catch {}
}
function CheckError() {
  try {
    return new URL(new Error().fileName).host;
  } catch {}
}

// src/lib/server/enable-hot-reload.ts
var socket = undefined;
function cleanup() {
  if (socket) {
    socket.onclose = () => {};
    socket.onerror = () => {};
    socket.onmessage = () => {};
    socket = undefined;
  }
}
function startup(serverhost) {
  try {
    socket = new WebSocket("ws://" + serverhost);
    if (socket !== undefined) {
      socket.onclose = () => cleanup();
      socket.onerror = () => cleanup();
      socket.onmessage = (event) => {
        if (event.data === "reload") {
          socket?.close();
          setTimeout(() => async_reloadOnServerRestart(serverhost), 100);
        }
      };
    }
  } catch (error) {
    Core_Console_Error(error);
  }
}
async function async_reloadOnServerRestart(serverhost) {
  try {
    await fetch(serverhost);
    window.location.reload();
  } catch {
    setTimeout(() => async_reloadOnServerRestart(serverhost), 100);
  }
}
function EnableHotReload(serverhost) {
  startup(serverhost ?? SERVERHOST);
}

// src/index.module.ts
EnableHotReload();
var parser = new DOMParser;
var parseHTML = (html) => parser.parseFromString(html, "text/html");
var div_pxem = WebPlatform_Node_QuerySelector("div#px-to-em").as(HTMLDivElement);
var pxem_input = WebPlatform_Node_Reference_Class(div_pxem.querySelector("input")).as(HTMLInputElement);
var pxem_table = WebPlatform_Node_Reference_Class(div_pxem.querySelector("pre.table")).as(HTMLPreElement);
var div_timestamp = WebPlatform_Node_QuerySelector("div#timestamp-to-date").as(HTMLDivElement);
var timestamp_div_result = WebPlatform_Node_Reference_Class(div_timestamp.querySelector("div#result")).as(HTMLDivElement);
var timestamp_form = WebPlatform_Node_Reference_Class(div_timestamp.querySelector("form")).as(HTMLFormElement);
var timestamp_input = WebPlatform_Node_Reference_Class(div_timestamp.querySelector("input")).as(HTMLInputElement);
await Async_WebPlatform_DOM_ReadyState_Callback({
  async load() {
    createPxEmTable();
    pxem_input.oninput = () => createPxEmTable();
    timestamp_input.defaultValue = `${Math.trunc(Date.now())}`;
    processTimestamp();
    timestamp_form.addEventListener("submit", (event) => {
      event.preventDefault();
      processTimestamp();
    });
  }
});
function createPxEmTable() {
  const input_length = Math.max(2, pxem_input.value.length);
  const div_rows = [];
  const px_value = Number.parseInt(pxem_input.value);
  for (let i = 0;i < px_value; i++) {
    const n = i + 1;
    const px_string = `${n}`.padStart(input_length, " ");
    const em_string = trimEmEnd((n / px_value).toFixed(5), "0", ".");
    const div = document.createElement("div");
    div.innerText = `${px_string}   ${em_string}`;
    div_rows.push(div);
  }
  while (pxem_table.childElementCount < div_rows.length) {
    pxem_table.appendChild(document.createElement("div"));
  }
  pxem_table.replaceChildren(`${"px".padStart(input_length, " ")}   em`, ...div_rows);
}
function trimEmEnd(text, ...chars) {
  let i = text.length;
  while (chars.includes(text[i - 1])) {
    --i;
  }
  return text.slice(0, i);
}
function processTimestamp() {
  try {
    const date = new Date(Number.parseInt(timestamp_input.value.trim(), 10));
    const html = parseHTML(`
      <div>the timestamp must be in milliseconds:</div>
      <div><b>GMT</b>            <span>${formatUTCDate(date)}</span></div>
      <div><b>Your time zone</b> <span>${formatDate(date)}</span></div>
    `).body.children;
    if (html) {
      timestamp_div_result.replaceChildren(...html);
      for (const span of timestamp_div_result.querySelectorAll("span")) {
        span.onclick = async () => {
          try {
            await navigator.clipboard.writeText(span.textContent);
          } catch (error) {
            Core_Console_Error(error);
          }
        };
      }
    }
  } catch (error) {
    Core_Console_Error(error);
  }
}
function formatDate(date) {
  let y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate(), hh = date.getHours(), mm = date.getMinutes(), ss = date.getSeconds(), ap = hh < 12 ? "AM" : "PM";
  hh = hh % 12 || 12;
  return y + "/" + (m < 10 ? "0" : "") + m + "/" + (d < 10 ? "0" : "") + d + ", " + hh + ":" + (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss + " " + ap;
}
function formatUTCDate(date) {
  let y = date.getUTCFullYear(), m = date.getUTCMonth() + 1, d = date.getUTCDate(), hh = date.getUTCHours(), mm = date.getUTCMinutes(), ss = date.getUTCSeconds(), ap = hh < 12 ? "AM" : "PM";
  hh = hh % 12 || 12;
  return y + "/" + (m < 10 ? "0" : "") + m + "/" + (d < 10 ? "0" : "") + d + ", " + hh + ":" + (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss + " " + ap;
}

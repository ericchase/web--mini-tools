import { Core_Console_Error } from './lib/ericchase/Core_Console_Error.js';
import { Async_WebPlatform_DOM_ReadyState_Callback } from './lib/ericchase/WebPlatform_DOM_ReadyState_Callback.js';
import { WebPlatform_Node_QuerySelector, WebPlatform_Node_Reference_Class } from './lib/ericchase/WebPlatform_Node_Reference_Class.js';
import { EnableHotReload } from './lib/server/enable-hot-reload.js';

EnableHotReload();

const parser = new DOMParser();
const parseHTML = (html: string) => parser.parseFromString(html, 'text/html');

const div_pxem = WebPlatform_Node_QuerySelector('div#px-to-em').as(HTMLDivElement);
const pxem_input = WebPlatform_Node_Reference_Class(div_pxem.querySelector('input')).as(HTMLInputElement);
const pxem_table = WebPlatform_Node_Reference_Class(div_pxem.querySelector('pre.table')).as(HTMLPreElement);

const div_timestamp = WebPlatform_Node_QuerySelector('div#timestamp-to-date').as(HTMLDivElement);
const timestamp_div_result = WebPlatform_Node_Reference_Class(div_timestamp.querySelector('div#result')).as(HTMLDivElement);
const timestamp_form = WebPlatform_Node_Reference_Class(div_timestamp.querySelector('form')).as(HTMLFormElement);
const timestamp_input = WebPlatform_Node_Reference_Class(div_timestamp.querySelector('input')).as(HTMLInputElement);

await Async_WebPlatform_DOM_ReadyState_Callback({
  async load() {
    createPxEmTable();
    pxem_input.oninput = () => createPxEmTable();

    timestamp_input.defaultValue = `${Math.trunc(Date.now() / 1000)}`;
    processTimestamp();
    timestamp_form.addEventListener('submit', (event) => {
      event.preventDefault();
      processTimestamp();
    });
  },
});

function createPxEmTable() {
  const input_length = Math.max(2, pxem_input.value.length);
  const div_rows = [];
  const px_value = Number.parseInt(pxem_input.value);
  for (let i = 0; i < px_value; i++) {
    const n = i + 1;
    const px_string = `${n}`.padStart(input_length, ' ');
    const em_string = trimEmEnd((n / px_value).toFixed(5), '0', '.');
    const div = document.createElement('div');
    div.innerText = `${px_string}   ${em_string}`;
    div_rows.push(div);
  }
  while (pxem_table.childElementCount < div_rows.length) {
    pxem_table.appendChild(document.createElement('div'));
  }
  pxem_table.replaceChildren(`${'px'.padStart(input_length, ' ')}   em`, ...div_rows);
}

function trimEmEnd(text: string, ...chars: string[]) {
  let i = text.length;
  while (chars.includes(text[i - 1])) {
    --i;
  }
  return text.slice(0, i);
}

function processTimestamp() {
  try {
    const date = new Date(Number.parseInt(timestamp_input.value.trim(), 10) * 1000);
    const html = parseHTML(`
      <div>the timestamp must be in seconds:</div>
      <div><b>GMT</b>            <span>${formatUTCDate(date)}</span></div>
      <div><b>Your time zone</b> <span>${formatDate(date)}</span></div>
    `).body.children;
    if (html) {
      timestamp_div_result.replaceChildren(...html);
      for (const span of timestamp_div_result.querySelectorAll('span')) {
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

function formatDate(date: Date) {
  let y = date.getFullYear(),
    m = date.getMonth() + 1,
    d = date.getDate(),
    hh = date.getHours(),
    mm = date.getMinutes(),
    ss = date.getSeconds(),
    ap = hh < 12 ? 'AM' : 'PM';
  hh = hh % 12 || 12; // Convert to 12-hour format, ensuring 12 instead of 0
  return y + '/' + (m < 10 ? '0' : '') + m + '/' + (d < 10 ? '0' : '') + d + ', ' + hh + ':' + (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss + ' ' + ap;
}

function formatUTCDate(date: Date) {
  let y = date.getUTCFullYear(),
    m = date.getUTCMonth() + 1,
    d = date.getUTCDate(),
    hh = date.getUTCHours(),
    mm = date.getUTCMinutes(),
    ss = date.getUTCSeconds(),
    ap = hh < 12 ? 'AM' : 'PM';
  hh = hh % 12 || 12; // Convert to 12-hour format, ensuring 12 instead of 0
  return y + '/' + (m < 10 ? '0' : '') + m + '/' + (d < 10 ? '0' : '') + d + ', ' + hh + ':' + (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss + ' ' + ap;
}

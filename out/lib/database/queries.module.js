// src/lib/ericchase/Core_Console_Error.ts
function Core_Console_Error(...items) {
  console["error"](...items);
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

// src/lib/database/dbdriver-localhost.ts
function getLocalhost(address) {
  return {
    async query(text, params) {
      const response = await fetch(`${address}/database/query`, {
        method: "POST",
        body: JSON.stringify({ text, params })
      });
      if (response.status < 200 || response.status > 299) {
        throw await response.json();
      }
      return await response.json();
    }
  };
}

// src/lib/database/queries.module.ts
var db = getLocalhost(`http://${SERVERHOST}/`);
async function DatabaseConnected() {
  const q = "SELECT 1";
  await db.query(q, []);
  return true;
}
async function CreateTable(name) {
  const q = `
      CREATE TABLE ${name} (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL
      );
    `;
  await db.query(q, []);
}
async function TableExists(name) {
  const q = `
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `;
  const { exists } = (await db.query(q, [name]))[0];
  return exists ?? false;
}
async function EnsureTableExists(name) {
  try {
    if (await TableExists(name) === true) {
      return { created: false, exists: true };
    }
    await CreateTable(name);
    if (await TableExists(name) === true) {
      return { created: true, exists: true };
    }
  } catch (error) {
    Core_Console_Error(error);
  }
  return { created: false, exists: false };
}
export {
  TableExists,
  EnsureTableExists,
  DatabaseConnected,
  CreateTable
};

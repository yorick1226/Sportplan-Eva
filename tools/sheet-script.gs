// Eva's sportplan → Google Sheet. Plak dit in Extensies → Apps Script en implementeer als web-app.
const SHEET_ID = "1i8cfNVxpOx_7HSvXc0ERRAuwOxf_IUJ6sHBwYqTM9D4";
const KEY = "eva-TnQ5zOOr_RT47gtL";
const HEAD = {
  "Sets":       ["id", "ontvangen", "datum", "week", "code", "oefening", "set", "kg", "herhalingen", "alternatief", "voelde niet goed", "notitie"],
  "Trainingen": ["id", "ontvangen", "datum", "week", "training", "afgevinkt", "zwaarte (1-10)"],
  "Lopen":      ["id", "ontvangen", "datum", "km", "minuten", "tempo (min/km)"],
  "Records":    ["id", "ontvangen", "oefening", "beste set", "datum"],
  "Backup":     ["id", "ontvangen", "gegevens (niet aanpassen)"]
};
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  if (d.key !== KEY) return ContentService.createTextOutput("nee");
  const ss = SpreadsheetApp.openById(SHEET_ID);
  if (ss.getSpreadsheetTimeZone() !== "Europe/Amsterdam") ss.setSpreadsheetTimeZone("Europe/Amsterdam");
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    (d.rows || []).forEach(r => {
      let sh = ss.getSheetByName(r.tab);
      if (!sh) { sh = ss.insertSheet(r.tab); sh.appendRow(HEAD[r.tab]); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEAD[r.tab].length).setFontWeight("bold"); }
      const row = [String(r.id), Utilities.formatDate(new Date(), "Europe/Amsterdam", "yyyy-MM-dd HH:mm")].concat(r.values);
      sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).setNumberFormat("@");
      const ids = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(x => normId(x[0])) : [];
      const i = ids.lastIndexOf(String(r.id));
      if (i >= 0) sh.getRange(i + 2, 1, 1, row.length).setValues([row]);
      else sh.appendRow(row);
    });
  } finally { lock.releaseLock(); }
  return ContentService.createTextOutput("ok");
}
function normId(v) { return (v instanceof Date) ? Utilities.formatDate(v, "Europe/Amsterdam", "yyyy-MM-dd") : String(v); }
// Eenmalig: alles als platte tekst zetten (zoals je het nu ziet), tijdzone naar Amsterdam, dubbele regels weg.
function opruimen() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  ["Sets", "Trainingen", "Lopen", "Records", "Backup"].forEach(name => {
    const sh = ss.getSheetByName(name); if (!sh || sh.getLastRow() < 2) return;
    const rng = sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn());
    const data = rng.getDisplayValues();
    const keep = new Map();
    data.forEach(row => {
      if (/^\w{3} \w{3} \d+ \d{4}/.test(row[0])) row[0] = Utilities.formatDate(new Date(row[0]), "UTC", "yyyy-MM-dd");
      if (name === "Trainingen" || name === "Lopen") row[2] = row[0];
      if (name === "Lopen" && +row[3] > 0 && +row[4] > 0) { const t = row[4] / row[3]; row[5] = Math.floor(t) + ":" + String(Math.round((t % 1) * 60)).padStart(2, "0"); }
      const id = row[0]; if (!id || /Verbindingstest/.test(row.join(" "))) return; keep.set(id, row); });
    rng.clearContent();
    sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).setNumberFormat("@");
    const rows = [...keep.values()];
    if (rows.length) sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  });
  ss.setSpreadsheetTimeZone("Europe/Amsterdam");
  Logger.log("opgeruimd");
}
function doGet() { return ContentService.createTextOutput("Eva's sportplan-ontvanger staat aan."); }
function testSchrijven() { const r = doPost({postData:{contents: JSON.stringify({key: KEY, rows:[{tab:"Backup", id:"laatste", values:["{}"]}]})}}); Logger.log(r.getContent()); }

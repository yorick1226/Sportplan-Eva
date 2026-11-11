// Maakt week-N.ics uit de WEEKS-data in index.html. Gebruik: node tools/make_week_ics.js N
const fs = require("fs"), vm = require("vm");
const N = +process.argv[2];
const html = fs.readFileSync(__dirname + "/../index.html", "utf8");
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const grab = (start, end) => { const a = js.indexOf(start), b = js.indexOf(end, a); return js.slice(a, b); };
const ctx = {};
vm.createContext(ctx);
vm.runInContext(grab("const EX = {", "/* ======================= RECEPTEN") + grab("const START", "const HABITS") +
  "\nthis.EX=EX;this.SESS=SESS;this.SESSNAME=SESSNAME;this.WEEKS=WEEKS;this.weekStart=weekStart;this.PH=PH;", ctx);
const { EX, SESS, SESSNAME, WEEKS, weekStart, PH } = ctx;
const wk = WEEKS[N], st = weekStart(N), off = wk.startOffset || 0;
const DUR = { kracht: 60, loop: 45, pilates: 60, tennis: 90 };
const DEF = { kracht: "09:00", loop: "08:00", pilates: "10:00", tennis: "18:00" };
const ICON = { kracht: "🏋️", loop: "👟", pilates: "🧘", tennis: "🎾" };
const URL = "https://yorick1226.github.io/Sportplan-Eva/";
const pad = n => String(n).padStart(2, "0");
const stamp = (d, hm) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${hm.replace(":", "")}00`;
const esc = s => String(s).replace(/<br>/g, "\\n").replace(/<[^>]+>/g, "").replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
let ev = [];
wk.days.forEach((d, i) => {
  if (d.type === "rust" || (d.opts && d.opts.done)) return;
  const date = new Date(st.getTime() + (i + off) * 864e5);
  const time = (d.opts && d.opts.time) || ((d.sub.match(/\b(\d{2}:\d{2})\b/) || [])[1]) || DEF[d.type] || "09:00";
  const [h, m] = time.split(":").map(Number), endMin = h * 60 + m + (DUR[d.type] || 60);
  const end = `${pad(Math.floor(endMin / 60))}:${pad(endMin % 60)}`;
  let desc = d.sub + "\\n\\n";
  if (d.opts && d.opts.note) desc += esc(d.opts.note) + "\\n\\n";
  if (d.session) {
    const list = (d.opts && d.opts.only) || SESS[d.session];
    desc += esc(SESSNAME[d.session]) + ":\\n" + list.map(k => `• ${k} ${esc(EX[k].n)}`).join("\\n") + "\\n\\n";
  }
  desc += "Eet 30–60 min vooraf iets kleins en binnen een uur erna iets met eiwit.\\n\\nOpen je app: " + URL;
  ev.push(`BEGIN:VEVENT
UID:w${N}-${stamp(date, "00:00")}-${i}@sportplan-eva
DTSTAMP:${stamp(new Date(), "00:00")}Z
DTSTART;TZID=Europe/Amsterdam:${stamp(date, time)}
DTEND;TZID=Europe/Amsterdam:${stamp(date, end)}
SUMMARY:${ICON[d.type] || "✨"} ${esc(d.name)}
DESCRIPTION:${desc}
URL:${URL}
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Over 30 min: ${esc(d.name)}. Eet iets kleins 🍌
TRIGGER:-PT30M
END:VALARM
END:VEVENT`);
});
const TZ = `BEGIN:VTIMEZONE
TZID:Europe/Amsterdam
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
END:VTIMEZONE`;
const out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Eva Sportplan//NL", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", TZ, ...ev, "END:VCALENDAR", ""].join("\r\n");
fs.writeFileSync(__dirname + `/../week-${N}.ics`, out.replace(/\r?\n/g, "\r\n"));
console.log(`week-${N}.ics: ${ev.length} trainingen`);

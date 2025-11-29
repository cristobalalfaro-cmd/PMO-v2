const qs = (sel, ctx=document) => ctx.querySelector(sel);
const qsa = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

function uniqueSorted(arr) {
  return Array.from(new Set(arr.filter(v => v != null && v !== ""))).sort((a,b) => (''+a).localeCompare((''+b), undefined, {numeric:true, sensitivity:'base'}));
}
function parseDate(str) {
  if (!str) return null;
  
  const monthsES = {
    'ene': 0, 'enero': 0,
    'feb': 1, 'febrero': 1,
    'mar': 2, 'marzo': 2,
    'abr': 3, 'abril': 3,
    'may': 4, 'mayo': 4,
    'jun': 5, 'junio': 5,
    'jul': 6, 'julio': 6,
    'ago': 7, 'agosto': 7,
    'sep': 8, 'sept': 8, 'septiembre': 8,
    'oct': 9, 'octubre': 9,
    'nov': 10, 'noviembre': 10,
    'dic': 11, 'diciembre': 11
  };
  
  const match = str.match(/^(\d{1,2})-([a-zA-Z]+)-(\d{4})$/);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthStr = match[2].toLowerCase();
    const year = parseInt(match[3], 10);
    const month = monthsES[monthStr];
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }
  
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}
function formatDateISO(d) {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  return `${yyyy}-${mm}-${dd}`;
}
function formatDateCL(d) {
  if (!d) return "";
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
function copyToClipboard(text){
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } finally { document.body.removeChild(ta); }
    return Promise.resolve();
  }
}
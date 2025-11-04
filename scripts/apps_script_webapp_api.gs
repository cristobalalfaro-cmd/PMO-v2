// Apps Script Web App (Deploy > New deployment > Web app; access: Anyone with the link)
// Actualiza múltiples columnas (Tareas, Owner, Deadline, Estatus) buscando por ID único.

const CFG = {
  SHEET_ID: 'REEMPLAZA_CON_TU_SHEET_ID', // opcional si el script está ligado
  SHEET_NAME: 'Proyectos',
  COL_ID: 'ID',
  API_KEY: '' // opcional
};

function doPost(e){
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    if (!payload || !payload.changes || !Array.isArray(payload.changes)) {
      return json({ ok:false, error:"Payload inválido" });
    }

    const ss = CFG.SHEET_ID ? SpreadsheetApp.openById(CFG.SHEET_ID) : SpreadsheetApp.getActive();
    const sh = ss.getSheetByName(CFG.SHEET_NAME);
    if (!sh) return json({ ok:false, error:"Hoja no encontrada" });

    const rng = sh.getDataRange();
    const data = rng.getValues();
    const header = data.shift(); // primera fila
    const idx = colIndexMap(header);

    const idCol = idx(CFG.COL_ID);
    if (idCol == null) return json({ ok:false, error:"Columna ID no encontrada" });

    const idToRow = new Map(); // ID -> row number (1-based within sheet)
    for (let r = 0; r < data.length; r++){
      const id = String(data[r][idCol]||'').trim();
      if (id) idToRow.set(id, r + 2); // +2 por header
    }

    let updated = 0;
    let fieldsUpdated = 0;
    
    for (const ch of payload.changes) {
      const id = String(ch.id || '').trim();
      if (!id || !ch.changes) continue;
      
      const rowNum = idToRow.get(id);
      if (!rowNum) continue;
      
      // Actualizar cada campo modificado
      for (const [fieldName, newValue] of Object.entries(ch.changes)) {
        const colIndex = idx(fieldName);
        if (colIndex != null) {
          sh.getRange(rowNum, colIndex + 1, 1, 1).setValue(newValue);
          fieldsUpdated++;
        }
      }
      updated++;
    }

    return json({ ok:true, updated, fieldsUpdated });
  } catch (err) {
    return json({ ok:false, error: String(err) });
  }
}

function json(obj){
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  return out.setMimeType(ContentService.MimeType.JSON);
}
function colIndexMap(header){ const m={}; header.forEach((h,i)=>m[h]=i); return name=>m[name]; }

/*
  GOOGLE APPS SCRIPT - Code.gs
  Copia este código íntegro en el editor de scripts de tu Google Sheet.
  Asegúrate de tener una hoja llamada: "MOVIMIENTOS"

  IMPORTANTE PARA EVITAR "FAILED TO FETCH":
  1. Ve a "Implementar" (Deploy) -> "Nueva implementación".
  2. Tipo: "Aplicación web".
  3. Ejecutar como: "Yo" (Tu cuenta).
  4. Quién tiene acceso: "Cualquiera" (Anyone). <--- ESTO ES VITAL.
  5. Copia la URL generada y pégala en App.tsx (API_URL).
*/

// 1. FUNCIÓN PARA LEER (Entrega los datos al frontend)
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("MOVIMIENTOS") || ss.insertSheet("MOVIMIENTOS");
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
  
  const headers = data[0];
  const movements = data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      let key = header.toString().toLowerCase();
      // Mapeo flexible para evitar errores de nombres en columnas
      if (key === 'folio' || key === 'id') key = 'id';
      if (key === 'concepto' || key === 'description') key = 'description';
      if (key === 'monto' || key === 'amount') key = 'amount';
      if (key === 'fecha' || key === 'date') key = 'date';
      if (key === 'tipo' || key === 'type') key = 'type';
      if (key === 'responsable' || key === 'responsible') key = 'responsible';
      if (key === 'estado' || key === 'status') key = 'status';
      obj[key] = row[i];
    });
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify(movements)).setMimeType(ContentService.MimeType.JSON);
}

// 2. FUNCIÓN PARA PROCESAR ACCIONES (Recibe datos del frontend)
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const params = JSON.parse(e.postData.contents);
  const action = params.action; // Determinamos qué hacer
  const payload = params.payload || params; // Compatibilidad

  const sheet = ss.getSheetByName("MOVIMIENTOS") || ss.insertSheet("MOVIMIENTOS");
  
  // Asegurar headers si la hoja está vacía
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "FECHA", "TIPO", "CATEGORIA", "MONTO", "RESPONSABLE", "STATUS", "ID_CORTE", "DESCRIPCION"]);
  }

  // --- ACCIÓN: ELIMINAR REGISTRO ---
  if (action === 'DELETE') {
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] == payload.id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return ContentService.createTextOutput("Eliminado").setMimeType(ContentService.MimeType.TEXT);
  }

  // --- ACCIÓN: CORTE DE CAJA (Archivar movimientos) ---
  if (action === 'CORTE') {
    const values = sheet.getDataRange().getValues();
    const idsToArchive = payload.movementIds || payload.ids;
    const cutId = payload.cutId;
    for (let i = 1; i < values.length; i++) {
      if (idsToArchive.includes(values[i][0])) {
        sheet.getRange(i + 1, 7).setValue("ARCHIVADO"); // Columna STATUS
        sheet.getRange(i + 1, 8).setValue(cutId); // Columna ID_CORTE
      }
    }
    return ContentService.createTextOutput("Corte Procesado").setMimeType(ContentService.MimeType.TEXT);
  }

  // --- ACCIÓN POR DEFECTO: AGREGAR REGISTRO ---
  const m = payload;
  sheet.appendRow([
    m.id,
    m.date,
    m.type,
    m.category || "General",
    m.amount,
    m.responsible,
    m.status,
    m.cutId || "",
    m.description || ""
  ]);
  
  return ContentService.createTextOutput("Éxito").setMimeType(ContentService.MimeType.TEXT);
}

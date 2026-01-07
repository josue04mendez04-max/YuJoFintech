
/*
  GOOGLE APPS SCRIPT - Code.gs
  Copia este código íntegro en el editor de scripts de tu Google Sheet.
  Asegúrate de tener dos hojas llamadas: "MOVIMIENTOS" y "CORTES"

  IMPORTANTE PARA EVITAR "FAILED TO FETCH":
  1. Ve a "Implementar" (Deploy) -> "Nueva implementación".
  2. Tipo: "Aplicación web".
  3. Ejecutar como: "Yo" (Tu cuenta).
  4. Quién tiene acceso: "Cualquiera" (Anyone). <--- ESTO ES VITAL.
  5. Copia la URL generada y pégala en App.tsx (API_URL).
*/

/** 
// 1. FUNCIÓN PARA LEER (Entrega los datos al frontend)
function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("MOVIMIENTOS");
  
  // Si la hoja no existe, la creamos o manejamos el error
  if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  
  // Convertir las filas de la hoja en objetos JSON
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

  return ContentService.createTextOutput(JSON.stringify(movements))
    .setMimeType(ContentService.MimeType.JSON);
}

// 2. FUNCIÓN PARA GUARDAR (Recibe datos del frontend)
function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const params = JSON.parse(e.postData.contents);
  
  // Manejo de Tipos de Entrada
  if (params.type === 'SUMMARY_CUT') {
    const cutSheet = ss.getSheetByName("CORTES") || ss.insertSheet("CORTES");
    if (cutSheet.getLastRow() === 0) {
      cutSheet.appendRow(["ID", "FECHA", "INGRESOS", "GASTOS", "BALANCE", "FISICO", "DIFERENCIA"]);
    }
    cutSheet.appendRow([
      params.id,
      params.date,
      params.ingresosTotal,
      params.gastosTotal,
      params.balanceSistema,
      params.conteoFisico,
      params.diferencia
    ]);
    return ContentService.createTextOutput("Corte Registrado").setMimeType(ContentService.MimeType.TEXT);
  }

  // Registro de Movimiento Estándar
  const sheet = ss.getSheetByName("MOVIMIENTOS") || ss.insertSheet("MOVIMIENTOS");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["ID", "FECHA", "TIPO", "CATEGORIA", "MONTO", "RESPONSABLE", "STATUS", "ID_CORTE", "AUTORIZACION"]);
  }
  
  sheet.appendRow([
    params.id,
    params.date,
    params.type,
    params.category || "General",
    params.amount,
    params.responsible,
    params.status,
    params.cutId || "",
    params.authorization
  ]);
  
  return ContentService.createTextOutput("Éxito").setMimeType(ContentService.MimeType.TEXT);
}
**/

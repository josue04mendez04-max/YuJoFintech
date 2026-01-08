/**
 * Firebase Connection Test Utilities
 * Archivo para ejecutar pruebas de conexión directamente en el navegador
 * 
 * Uso en consola del navegador (F12):
 * - paste el código aquí
 * - Ejecuta: testConnection()
 */

// ============================================================
// UTILIDADES DE TESTING (Copiar en la consola del navegador)
// ============================================================

const testConnection = async () => {
  console.clear();
  console.log('%c🧪 INICIANDO PRUEBAS DE FIREBASE', 'color: blue; font-size: 16px; font-weight: bold;');
  console.log('═'.repeat(60));

  try {
    // Test 1: Verificar que firebase existe
    console.log('\n%c✅ Test 1: Verificando Firebase globalmente', 'color: green;');
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase no está disponible. ¿Está cargado el script?');
    }
    console.log('   → Firebase detectado correctamente');

    // Test 2: Verificar Firestore
    console.log('\n%c✅ Test 2: Accediendo a Firestore', 'color: green;');
    const db = firebase.firestore();
    console.log('   → Firestore inicializado');

    // Test 3: Leer documentos
    console.log('\n%c✅ Test 3: Leyendo documentos de "yujofintech"', 'color: green;');
    const snapshot = await db.collection('yujofintech')
      .orderBy('date', 'desc')
      .limit(5)
      .get();

    console.log(`   ✓ Documentos encontrados: ${snapshot.size}`);
    
    if (snapshot.size > 0) {
      console.log('\n   Primeros documentos:');
      snapshot.forEach((doc, idx) => {
        const data = doc.data();
        console.log(`   [${idx + 1}] ${doc.id}`);
        console.log(`       Type: ${data.type} | Amount: ${data.amount} | Date: ${data.date}`);
      });
    } else {
      console.log('   ℹ️  No hay documentos en la colección');
    }

    // Test 4: Crear documento de prueba
    console.log('\n%c✅ Test 4: Creando documento de prueba', 'color: green;');
    const testDoc = {
      type: 'INGRESO',
      category: 'Prueba',
      amount: 50000,
      description: '🧪 Conexión exitosa - ' + new Date().toLocaleTimeString(),
      responsible: 'Sistema',
      authorization: 'TEST_AUTO',
      date: new Date().toISOString(),
      status: 'PENDIENTE_CORTE'
    };

    const docRef = await db.collection('yujofintech').add(testDoc);
    console.log(`   ✓ Documento creado: ${docRef.id}`);

    // Test 5: Leer el documento creado
    console.log('\n%c✅ Test 5: Verificando documento creado', 'color: green;');
    const createdDoc = await docRef.get();
    const createdData = createdDoc.data();
    console.log('   Datos guardados correctamente:');
    console.log(createdData);

    // Test 6: Actualizar documento
    console.log('\n%c✅ Test 6: Actualizando documento', 'color: green;');
    await docRef.update({
      status: 'EN_CURSO',
      description: createdData.description + ' [ACTUALIZADO]'
    });
    console.log('   ✓ Documento actualizado');

    // Test 7: Verificar actualización
    console.log('\n%c✅ Test 7: Verificando actualización', 'color: green;');
    const updatedDoc = await docRef.get();
    console.log('   Datos después de actualización:');
    console.log(updatedDoc.data());

    // Test 8: Eliminar documento
    console.log('\n%c✅ Test 8: Eliminando documento de prueba', 'color: green;');
    await docRef.delete();
    console.log('   ✓ Documento eliminado');

    // Test 9: Confirmación final
    console.log('\n%c✅ Test 9: Confirmación final', 'color: green;');
    const finalDoc = await docRef.get();
    if (!finalDoc.exists) {
      console.log('   ✓ Confirmado: Documento fue eliminado correctamente');
    }

    // Resumen
    console.log('\n' + '═'.repeat(60));
    console.log('%c✅ TODAS LAS PRUEBAS PASARON', 'color: green; font-size: 16px; font-weight: bold;');
    console.log('═'.repeat(60));
    console.log('\n%c📊 Resumen:', 'font-weight: bold;');
    console.log('   ✓ Conexión a Firebase: OK');
    console.log('   ✓ Lectura de datos: OK');
    console.log('   ✓ Creación de registros: OK');
    console.log('   ✓ Actualización de registros: OK');
    console.log('   ✓ Eliminación de registros: OK');
    console.log('\n%c🎉 Firebase está funcionando correctamente', 'color: green; font-size: 14px; font-weight: bold;');

  } catch (error) {
    console.log('\n' + '═'.repeat(60));
    console.error('%c❌ ERROR EN LAS PRUEBAS', 'color: red; font-size: 16px; font-weight: bold;');
    console.log('═'.repeat(60));
    console.error('\nError:', error.message);
    console.error('Código:', error.code);
    console.error('Detalles completos:', error);

    // Sugerencias basadas en el error
    if (error.code === 'permission-denied') {
      console.log('\n%c💡 Sugerencia:', 'color: orange; font-weight: bold;');
      console.log('   Revisa las Firestore Security Rules');
      console.log('   Firebase Console → Firestore → Rules');
    } else if (error.code === 'not-found') {
      console.log('\n%c💡 Sugerencia:', 'color: orange; font-weight: bold;');
      console.log('   Verifica que el Project ID sea "easyrep-a1"');
    } else if (error.message.includes('not available')) {
      console.log('\n%c💡 Sugerencia:', 'color: orange; font-weight: bold;');
      console.log('   Firebase no está disponible. Verifica que firebase.config.ts esté correcto');
    }
  }
};

// Función para ver estadísticas
const firebaseStats = async () => {
  console.clear();
  console.log('%c📊 ESTADÍSTICAS DE FIRESTORE', 'color: blue; font-size: 14px; font-weight: bold;');
  
  try {
    const db = firebase.firestore();
    const snapshot = await db.collection('yujofintech').get();
    
    const stats = {
      total: snapshot.size,
      ingresos: 0,
      gastos: 0,
      inversiones: 0,
      pendiente: 0,
      completado: 0,
      archivado: 0,
      totalAmount: 0
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      stats[data.type.toLowerCase()] = (stats[data.type.toLowerCase()] || 0) + 1;
      stats[data.status.toLowerCase()] = (stats[data.status.toLowerCase()] || 0) + 1;
      stats.totalAmount += data.amount;
    });

    console.log('Total de movimientos:', stats.total);
    console.log('Ingresos:', stats.ingresos);
    console.log('Gastos:', stats.gastos);
    console.log('Inversiones:', stats.inversiones);
    console.log('Pendiente:', stats.pendiente);
    console.log('Completado:', stats.completado);
    console.log('Archivado:', stats.archivado);
    console.log('Monto total:', stats.totalAmount);

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
  }
};

// Función para ver últimos movimientos
const recentMovements = async (limit = 10) => {
  try {
    const db = firebase.firestore();
    const snapshot = await db.collection('yujofintech')
      .orderBy('date', 'desc')
      .limit(limit)
      .get();

    console.clear();
    console.log(`%c📋 ÚLTIMOS ${limit} MOVIMIENTOS`, 'color: blue; font-size: 14px; font-weight: bold;');
    console.log('═'.repeat(60));

    snapshot.forEach((doc, idx) => {
      const data = doc.data();
      console.log(`\n[${idx + 1}] ${doc.id}`);
      console.log(`    Type: ${data.type}`);
      console.log(`    Amount: ${data.amount}`);
      console.log(`    Date: ${data.date}`);
      console.log(`    Status: ${data.status}`);
      console.log(`    Description: ${data.description}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
};

// Función para limpiar datos de prueba
const cleanupTestData = async () => {
  if (!confirm('¿Estás seguro? Esto eliminará todos los documentos con "Prueba" en la descripción')) {
    return;
  }

  try {
    const db = firebase.firestore();
    const snapshot = await db.collection('yujofintech')
      .where('description', '>=', '🧪')
      .where('description', '<', '🧪' + 'z')
      .get();

    console.log(`Eliminando ${snapshot.size} documentos de prueba...`);
    
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✓ ${snapshot.size} documentos eliminados`);

  } catch (error) {
    console.error('Error:', error);
  }
};

// ============================================================
// INSTRUCCIONES DE USO
// ============================================================

console.log(`
%c🚀 HERRAMIENTAS DE TESTING FIREBASE

Para usar estas funciones, copia y pega en la consola (F12):

  ✅ Ejecutar pruebas completas:
     testConnection()

  📊 Ver estadísticas:
     firebaseStats()

  📋 Ver últimos movimientos:
     recentMovements(10)

  🧹 Limpiar datos de prueba:
     cleanupTestData()

`, 'color: green; font-weight: bold; font-size: 12px;');

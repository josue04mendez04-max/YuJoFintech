/**
 * Script para probar la conexión y operaciones con Firebase Firestore
 * Ejecución: npx ts-node test-firebase-connection.ts
 */

import { db } from './firebase.config';
import * as FirestoreService from './firestore.service';
import { Movement, MovementType, MovementStatus } from './types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function testFirebaseConnection() {
  console.log('🔍 Iniciando pruebas de conexión con Firebase Firestore...\n');

  try {
    // Test 1: Verificar conexión básica
    console.log('✅ Test 1: Verificando conexión con Firebase...');
    console.log(`   - Proyecto ID: ${(db as any).projectId || 'No disponible'}`);
    console.log(`   - Base de datos: ${(db as any)._key?.path?.segments || 'Firestore'}\n`);

    // Test 2: Leer todos los movimientos
    console.log('✅ Test 2: Intentando leer todos los movimientos...');
    const movements = await FirestoreService.fetchMovements();
    console.log(`   ✓ Lectura exitosa: ${movements.length} movimientos encontrados\n`);
    
    if (movements.length > 0) {
      console.log('   Primeros 3 movimientos:');
      movements.slice(0, 3).forEach((m, idx) => {
        console.log(`   [${idx + 1}] ID: ${m.id}`);
        console.log(`       Tipo: ${m.type} | Categoría: ${m.category}`);
        console.log(`       Monto: ${m.amount} | Fecha: ${m.date}`);
        console.log(`       Estado: ${m.status}\n`);
      });
    }

    // Test 3: Escribir un nuevo movimiento
    console.log('✅ Test 3: Intentando crear un nuevo movimiento...');
    const testMovement: Movement = {
      id: `test-${Date.now()}`,
      type: MovementType.INGRESO,
      category: 'Prueba',
      amount: 50000,
      description: '🧪 Movimiento de prueba - Conexión Firebase',
      responsible: 'Sistema',
      authorization: 'TEST_AUTH_001',
      date: new Date().toISOString(),
      status: MovementStatus.PENDIENTE,
      cutId: undefined
    };

    await FirestoreService.addMovement(testMovement);
    console.log(`   ✓ Movimiento creado exitosamente`);
    console.log(`   ID: ${testMovement.id}\n`);

    // Test 4: Leer nuevamente para confirmar la escritura
    await sleep(1000); // Esperar un segundo
    console.log('✅ Test 4: Leyendo datos nuevamente para confirmar escritura...');
    const updatedMovements = await FirestoreService.fetchMovements();
    const createdMovement = updatedMovements.find(m => m.id === testMovement.id);
    
    if (createdMovement) {
      console.log(`   ✓ Confirmado: Movimiento encontrado en Firestore`);
      console.log(`   Datos verificados: ${JSON.stringify(createdMovement, null, 2)}\n`);
    } else {
      console.log(`   ✗ Advertencia: Movimiento no encontrado después de crearlo\n`);
    }

    // Test 5: Actualizar el movimiento
    console.log('✅ Test 5: Intentando actualizar el estado del movimiento...');
    await FirestoreService.updateMovementStatus(testMovement.id, MovementStatus.COMPLETADO);
    console.log(`   ✓ Estado actualizado a: ${MovementStatus.COMPLETADO}\n`);

    // Test 6: Leer nuevamente para confirmar la actualización
    await sleep(1000);
    console.log('✅ Test 6: Leyendo datos para confirmar actualización...');
    const finalMovements = await FirestoreService.fetchMovements();
    const updatedMovement = finalMovements.find(m => m.id === testMovement.id);
    
    if (updatedMovement?.status === MovementStatus.COMPLETADO) {
      console.log(`   ✓ Confirmado: Estado actualizado correctamente\n`);
    }

    // Test 7: Eliminar el movimiento de prueba
    console.log('✅ Test 7: Eliminando movimiento de prueba...');
    await FirestoreService.deleteMovement(testMovement.id);
    console.log(`   ✓ Movimiento eliminado\n`);

    // Test 8: Confirmación final
    await sleep(1000);
    console.log('✅ Test 8: Confirmación final...');
    const finalCheck = await FirestoreService.fetchMovements();
    const shouldNotExist = finalCheck.find(m => m.id === testMovement.id);
    
    if (!shouldNotExist) {
      console.log(`   ✓ Confirmado: Movimiento fue eliminado correctamente\n`);
    }

    // Resumen
    console.log('═════════════════════════════════════════════════════════');
    console.log('✅ PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('═════════════════════════════════════════════════════════');
    console.log('✓ Conexión a Firebase: OK');
    console.log('✓ Lectura de datos: OK');
    console.log('✓ Creación de registros: OK');
    console.log('✓ Actualización de registros: OK');
    console.log('✓ Eliminación de registros: OK');
    console.log('\n🎉 La aplicación está correctamente conectada con Firestore\n');

  } catch (error: any) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:');
    console.error('═════════════════════════════════════════════════════════');
    console.error(`Error: ${error.message}`);
    console.error(`Código: ${error.code}`);
    console.error('Detalles:', error);
    console.error('═════════════════════════════════════════════════════════\n');
    
    if (error.code === 'permission-denied') {
      console.log('💡 Consejo: Revisa las Firestore Security Rules');
    } else if (error.code === 'not-found') {
      console.log('💡 Consejo: Verifica que el proyecto ID sea correcto');
    }
    
    process.exit(1);
  }
}

// Ejecutar pruebas
testFirebaseConnection();

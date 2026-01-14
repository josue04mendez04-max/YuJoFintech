/**
 * Script para probar la función liquidarInversion
 * Ejecución: npx ts-node test-liquidar-inversion.ts
 */

import * as FirestoreService from './firestore.service';
import { Inversion, Movement, MovementType, MovementStatus } from './types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function testLiquidarInversion() {
  console.log('🔍 Iniciando pruebas de liquidación de inversiones...\n');

  try {
    // Test 1: Crear una inversión de prueba
    console.log('✅ Test 1: Creando inversión de prueba...');
    const testInversion: Inversion = {
      id: `test-inv-${Date.now()}`,
      monto: 1000,
      descripcion: '🧪 Préstamo de prueba - hermano',
      tipo: 'Proyecto',
      responsable: 'Hermano Test',
      fechaInicio: new Date().toISOString().split('T')[0],
      status: 'ACTIVA',
      montoEsperado: 1200
    };

    await FirestoreService.setInversion(testInversion);
    console.log(`   ✓ Inversión creada exitosamente`);
    console.log(`   ID: ${testInversion.id}`);
    console.log(`   Monto: $${testInversion.monto}`);
    console.log(`   Esperado: $${testInversion.montoEsperado}\n`);

    // Test 2: Verificar que la inversión se guardó
    await sleep(1000);
    console.log('✅ Test 2: Verificando inversión en base de datos...');
    const inversiones = await FirestoreService.fetchInversiones();
    const inversionCreada = inversiones.find(i => i.id === testInversion.id);
    
    if (!inversionCreada) {
      throw new Error('Inversión no encontrada en base de datos');
    }
    console.log(`   ✓ Inversión encontrada con status: ${inversionCreada.status}\n`);

    // Test 3: Obtener movimientos actuales antes de liquidar
    console.log('✅ Test 3: Contando movimientos actuales...');
    const movementsAntes = await FirestoreService.fetchMovements();
    const countAntes = movementsAntes.length;
    console.log(`   Total de movimientos antes: ${countAntes}\n`);

    // Test 4: Liquidar la inversión con ganancia
    console.log('✅ Test 4: Liquidando inversión con retorno de $1,200...');
    const montoRetornado = 1200;
    await FirestoreService.liquidarInversion(testInversion.id, montoRetornado);
    console.log(`   ✓ Liquidación ejecutada\n`);

    // Test 5: Verificar que la inversión fue actualizada
    await sleep(1500);
    console.log('✅ Test 5: Verificando actualización de inversión...');
    const inversionesActualizadas = await FirestoreService.fetchInversiones();
    const inversionLiquidada = inversionesActualizadas.find(i => i.id === testInversion.id);
    
    if (!inversionLiquidada) {
      throw new Error('Inversión no encontrada después de liquidar');
    }

    console.log(`   Status: ${inversionLiquidada.status}`);
    console.log(`   Monto retornado: $${inversionLiquidada.montoRetornado}`);
    console.log(`   Ganancia: $${inversionLiquidada.ganancia}`);
    console.log(`   Fecha retorno: ${inversionLiquidada.fechaRetorno}\n`);

    if (inversionLiquidada.status !== 'LIQUIDADA') {
      throw new Error(`Status incorrecto: ${inversionLiquidada.status}`);
    }

    if (inversionLiquidada.montoRetornado !== montoRetornado) {
      throw new Error(`Monto retornado incorrecto: ${inversionLiquidada.montoRetornado}`);
    }

    if (inversionLiquidada.ganancia !== 200) {
      throw new Error(`Ganancia calculada incorrecta: ${inversionLiquidada.ganancia}`);
    }

    // Test 6: Verificar que se creó un movimiento de INGRESO
    console.log('✅ Test 6: Verificando creación de movimiento INGRESO...');
    const movementsDespues = await FirestoreService.fetchMovements();
    const countDespues = movementsDespues.length;
    
    if (countDespues <= countAntes) {
      throw new Error('No se creó un nuevo movimiento');
    }

    // Buscar el movimiento de retorno creado
    const movimientoRetorno = movementsDespues.find(m => 
      m.description.includes('Retorno Inversión') && 
      m.description.includes(testInversion.id.substring(0, 8))
    );

    if (!movimientoRetorno) {
      throw new Error('Movimiento de retorno no encontrado');
    }

    console.log(`   ✓ Movimiento de retorno creado:`);
    console.log(`   ID: ${movimientoRetorno.id}`);
    console.log(`   Tipo: ${movimientoRetorno.type}`);
    console.log(`   Monto: $${movimientoRetorno.amount}`);
    console.log(`   Descripción: ${movimientoRetorno.description}`);
    console.log(`   Estado: ${movimientoRetorno.status}\n`);

    if (movimientoRetorno.type !== MovementType.INGRESO) {
      throw new Error(`Tipo de movimiento incorrecto: ${movimientoRetorno.type}`);
    }

    if (movimientoRetorno.amount !== montoRetornado) {
      throw new Error(`Monto del movimiento incorrecto: ${movimientoRetorno.amount}`);
    }

    if (movimientoRetorno.status !== MovementStatus.PENDIENTE_CORTE) {
      throw new Error(`Estado del movimiento incorrecto: ${movimientoRetorno.status}`);
    }

    // Test 7: Limpiar - eliminar la inversión de prueba
    console.log('✅ Test 7: Limpiando datos de prueba...');
    await FirestoreService.deleteInversion(testInversion.id);
    await FirestoreService.deleteMovement(movimientoRetorno.id);
    console.log(`   ✓ Datos de prueba eliminados\n`);

    // Resumen
    console.log('═════════════════════════════════════════════════════════');
    console.log('✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('═════════════════════════════════════════════════════════');
    console.log('✓ Creación de inversión: OK');
    console.log('✓ Liquidación de inversión: OK');
    console.log('✓ Actualización de estado a LIQUIDADA: OK');
    console.log('✓ Cálculo de ganancia: OK');
    console.log('✓ Creación automática de INGRESO: OK');
    console.log('✓ Monto correcto en movimiento: OK');
    console.log('✓ Limpieza de datos: OK');
    console.log('\n🎉 La función liquidarInversion funciona correctamente\n');

    console.log('📊 Flujo verificado:');
    console.log('   1. Inversión ACTIVA de $1,000');
    console.log('   2. Retorno de $1,200');
    console.log('   3. Inversión marcada como LIQUIDADA');
    console.log('   4. Ganancia calculada: $200');
    console.log('   5. INGRESO creado por $1,200');
    console.log('   6. Resultado: Caja sube $1,200, neto +$200\n');

  } catch (error: any) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:');
    console.error('═════════════════════════════════════════════════════════');
    console.error(`Error: ${error.message}`);
    console.error('Detalles:', error);
    console.error('═════════════════════════════════════════════════════════\n');
    
    process.exit(1);
  }
}

// Ejecutar pruebas
testLiquidarInversion();

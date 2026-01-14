# Sistema de Liquidación de Inversiones

## Resumen

Este documento describe el sistema implementado para manejar correctamente las inversiones como activos en lugar de gastos, permitiendo que el patrimonio total se mantenga correcto cuando se presta dinero y cuando este regresa.

## Problema Resuelto

**Antes:** El sistema trataba las inversiones (dinero prestado) como gastos (dinero perdido), causando que:
- El balance mostrara números rojos cuando se prestaba dinero
- No había forma de registrar el retorno del dinero
- El patrimonio total no reflejaba la realidad (dinero en la calle + efectivo en mano)

**Ahora:** Las inversiones se manejan como activos que salen temporalmente pero vuelven:
- El patrimonio total permanece constante al prestar dinero
- Existe un sistema para liquidar inversiones y registrar retornos
- El dashboard muestra claramente: Efectivo en Mano + Capital en la Calle = Patrimonio Total

## Arquitectura de la Solución

### 1. Tipos de Datos (types.ts)

La interfaz `Inversion` ahora incluye campos para controlar el ciclo de vida completo, y el enum `InversionStatus` se extendió con el estado `LIQUIDADA`:

```typescript
export enum InversionStatus {
  ACTIVA = 'ACTIVA',
  PENDIENTE_RETORNO = 'PENDIENTE_RETORNO',
  COMPLETADA = 'COMPLETADA',
  LIQUIDADA = 'LIQUIDADA' // Nueva: inversión liquidada con retorno registrado
}

export interface Inversion {
  // ... campos existentes ...
  status: InversionStatus;
  
  // Campos nuevos para control del ciclo de vida
  montoEsperado?: number;    // Cuánto se espera recibir
  montoRetornado?: number;   // Cuánto realmente regresó
  fechaRetorno?: string;     // Fecha en que volvió el dinero
  ganancia?: number;         // Diferencia (montoRetornado - monto)
}
```

### 2. Función de Liquidación (firestore.service.ts)

La función `liquidarInversion` realiza dos operaciones atómicas:

```typescript
export const liquidarInversion = async (
  inversionId: string,
  montoRetornado: number,
  fechaRetorno?: string
): Promise<void>
```

**Proceso:**
1. Valida parámetros de entrada (ID válido, monto > 0)
2. Busca la inversión original en Firestore
3. Verifica que la inversión no esté ya liquidada
4. Calcula la ganancia: `montoRetornado - monto`
5. Actualiza la inversión:
   - `status`: InversionStatus.LIQUIDADA
   - `montoRetornado`: el monto que regresó
   - `fechaRetorno`: la fecha de retorno
   - `ganancia`: la utilidad obtenida
6. Crea automáticamente un nuevo movimiento de tipo `INGRESO`:
   - Monto: el total que regresó
   - Descripción: "Retorno Inversión [Folio XXX] - {descripción original}"
   - Estado: PENDIENTE_CORTE (para incluirse en el próximo corte)

### 3. Cálculo de Balances (Dashboard.tsx)

El dashboard ahora separa los saldos en tres cubetas:

#### Efectivo en Mano (Caja)
```
Ingresos - Gastos - Inversiones Salientes
```
Es el dinero físico disponible. Baja cuando se presta dinero.

#### Capital en la Calle
```
Suma de inversiones con status='ACTIVA' o 'PENDIENTE_RETORNO'
```
Es el dinero que está con otras personas pero sigue siendo tuyo.

#### Patrimonio Total
```
Efectivo en Mano + Capital en la Calle
```
Es el valor real de todos tus activos. **Este es el número que debe verse en grande.**

## Flujo de Uso

### Escenario Completo

**Situación Inicial:**
- Tienes $3,000 en caja

**Paso 1: Crear Inversión**
- Le prestas $1,000 a tu hermano
- Se crea una inversión con `status: InversionStatus.ACTIVA`
- Resultado:
  - Efectivo en Mano: $2,000 ✓
  - Capital en la Calle: $1,000 ✓
  - Patrimonio Total: $3,000 ✓ (¡no cambió!)

**Paso 2: Esperar**
- El dashboard muestra que tienes $1,000 en "Inversiones Activas"
- Puedes ver que el dinero está prestado pero sigue siendo tuyo

**Paso 3: Tu hermano paga ($1,200)**
- Ejecutas: `liquidarInversion(inversionId, 1200)`
- El sistema automáticamente:
  - Marca la inversión como LIQUIDADA
  - Calcula ganancia: $200
  - Crea un INGRESO de $1,200

**Resultado Final:**
- Efectivo en Mano: $2,000 + $1,200 = $3,200 ✓
- Capital en la Calle: $0 (inversión liquidada) ✓
- Patrimonio Total: $3,200 ✓
- **Ganancia neta: $200** 🎉

## Ejemplo de Código

### Liquidar una Inversión

```typescript
import { liquidarInversion } from './firestore.service';

// Caso 1: Liquidar con la fecha de hoy
await liquidarInversion('inv-123', 1200);

// Caso 2: Liquidar con fecha específica
await liquidarInversion('inv-123', 1200, '2026-01-14');
```

### En un Componente React

```typescript
const handleLiquidarInversion = async (inversionId: string, monto: number) => {
  try {
    await liquidarInversion(inversionId, monto);
    
    // Recargar datos
    const inversionesActualizadas = await fetchInversiones();
    setInversiones(inversionesActualizadas);
    
    const movementsActualizados = await fetchMovements();
    setMovements(movementsActualizados);
    
    console.log('✓ Inversión liquidada exitosamente');
  } catch (error) {
    console.error('Error al liquidar inversión:', error);
  }
};
```

## Compatibilidad con Datos Existentes

La implementación mantiene compatibilidad total con inversiones existentes:

- Inversiones con `status: 'ACTIVA'` o `'PENDIENTE_RETORNO'` se consideran activas (capital en la calle)
- Inversiones con `status: 'COMPLETADA'` o `'LIQUIDADA'` se consideran cerradas (para cálculo de ROI)
- Los nuevos campos opcionales (`montoEsperado`, `fechaRetorno`, `ganancia`) se agregan solo cuando se liquida una inversión

## Testing

Se incluye un script de prueba completo: `test-liquidar-inversion.ts`

**Ejecutar:**
```bash
npx ts-node test-liquidar-inversion.ts
```

**Pruebas incluidas:**
- ✓ Creación de inversión
- ✓ Liquidación con ganancia
- ✓ Actualización de estado a LIQUIDADA
- ✓ Cálculo correcto de ganancia
- ✓ Creación automática de INGRESO
- ✓ Monto correcto en movimiento
- ✓ Limpieza de datos de prueba

## Visualización en Dashboard

El panel principal ahora muestra:

```
┌─────────────────────────────────────────┐
│  PATRIMONIO TOTAL • CICLO ACTUAL       │
│                                         │
│         $3,200.00                      │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ Efectivo:    │  │ Capital en   │   │
│  │ $2,000       │  │ la Calle:    │   │
│  │              │  │ $1,200       │   │
│  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────┘
```

## Seguridad y Validaciones

- ✓ Verifica que la inversión existe antes de liquidar
- ✓ Calcula automáticamente la ganancia
- ✓ Registra timestamp de todas las operaciones
- ✓ Mantiene trazabilidad completa (vincula INGRESO con inversión)
- ✓ Estado transicional claro (ACTIVA → LIQUIDADA)

## Próximos Pasos (Opcional)

Posibles mejoras futuras:
1. Botón "Liquidar" en UI de inversiones
2. Alertas para inversiones próximas a vencer
3. Reportes de ROI histórico
4. Liquidación parcial de inversiones
5. Múltiples retornos para una misma inversión

## Soporte

Para preguntas o problemas, revisa:
- `types.ts` - Definición de tipos
- `firestore.service.ts` - Función liquidarInversion
- `Dashboard.tsx` - Cálculos de balance
- `test-liquidar-inversion.ts` - Pruebas funcionales

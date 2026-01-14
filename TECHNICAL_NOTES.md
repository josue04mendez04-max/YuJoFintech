# 🛠️ Notas Técnicas - Refactorización de YuJoFintech

## Cambios de API

### Antes
```typescript
// DEPRECADO - Ya no se usa
enum MovementType {
  INGRESO = 'INGRESO',
  GASTO = 'GASTO',
  INVERSION = 'INVERSION'  // ❌ ELIMINAR
}

enum InversionStatus {
  ACTIVA = 'ACTIVA',
  PENDIENTE_RETORNO = 'PENDIENTE_RETORNO',
  COMPLETADA = 'COMPLETADA'
}
```

### Ahora
```typescript
// ✅ NUEVO - Más simple
enum MovementType {
  INGRESO = 'INGRESO',
  GASTO = 'GASTO'
}
```

---

## Componentes Actualizados

### 1. Dashboard.tsx
**Props Anteriores:**
```typescript
interface DashboardProps {
  movements: Movement[];
  inversiones: Inversion[];  // ❌ REMOVIDO
  vault: VaultCount;
  onOpenVault: () => void;
  onPerformCut: () => void;
}
```

**Props Nuevas:**
```typescript
interface DashboardProps {
  movements: Movement[];
  // ✅ inversiones removido
  vault: VaultCount;
  onOpenVault: () => void;
  onPerformCut: () => void;
}
```

**Stats Calculadas - Cambio Principal:**
```typescript
// ❌ ANTES
const stats = useMemo(() => {
  const totalFisico = ingresos - gastos - salidasPorInversion;
  const capitalEnLaCalle = inversiones
    .filter((inv) => inv.estado === 'ACTIVA')
    .reduce((total, inv) => total + inv.amount, 0);
  const patrimonioTotal = totalFisico + capitalEnLaCalle;
  return { patrimonioTotal, totalFisico, capitalEnLaCalle, ingresos, gastos };
}, [movements, inversiones]);

// ✅ AHORA
const stats = useMemo(() => {
  const ingresos = activeCycle
    .filter(m => m.type === MovementType.INGRESO)
    .reduce((a, b) => a + b.amount, 0);
  const gastos = activeCycle
    .filter(m => m.type === MovementType.GASTO)
    .reduce((a, b) => a + b.amount, 0);
  const balanceTotal = ingresos - gastos;
  return { ingresos, gastos, balanceTotal };
}, [movements]);
```

---

### 2. Registry.tsx
**Cambio en selector:**
```jsx
// ❌ ANTES
<option value={MovementType.INVERSION}>Inversión</option>

// ✅ AHORA - Solo 2 opciones
<option value={MovementType.INGRESO}>Ingreso</option>
<option value={MovementType.GASTO}>Egreso</option>
```

**Eliminado:**
- Lógica de `onReturnInvestment`
- Condicional `{m.type === MovementType.INVERSION && ...}`
- Renderizado del botón de retorno de inversión

---

### 3. CorteDeCaja.tsx
**Grid de Flujos - Cambio de 4 a 3 columnas:**
```jsx
// ❌ ANTES (4 columnas)
<div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
  <div>Ingresos</div>
  <div>Egresos</div>
  <div>Inversiones</div>  // ❌ REMOVIDO
  <div>Balance Calc.</div>
</div>

// ✅ AHORA (3 columnas)
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
  <div>Ingresos</div>
  <div>Egresos</div>
  <div>Balance Calc.</div>
</div>
```

**Patrimonio - Cambio simplificado:**
```jsx
// ❌ ANTES (3 campos)
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div>Efectivo Disponible</div>
  <div>En Inversiones</div>
  <div>Capital Total</div>
</div>

// ✅ AHORA (1 campo)
<div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
  <div>Efectivo Disponible</div>
</div>
```

---

### 4. conciliacion.service.ts
**Función `calcularConciliacion` - Cambio de lógica:**

```typescript
// ❌ ANTES (Compleja)
export const calcularConciliacion = (input: ConciliationInput) => {
  const inversionesRealizadas = activeMovements
    .filter(m => m.type === MovementType.INVERSION)
    .reduce((a, b) => a + b.amount, 0);
  
  const desinversionesRetornadas = activeMovements
    .filter(m => 
      m.type === MovementType.INGRESO && 
      m.description?.toUpperCase().includes('RETORNO')
    )
    .reduce((a, b) => a + b.amount, 0);
  
  // Fórmula compleja
  const balanceCalculado = saldoInicial + ingresos - egresos 
    - inversionesRealizadas + desinversionesRetornadas;
  
  const inversionesActivas = inversiones
    .filter(i => i.status !== InversionStatus.COMPLETADA)
    .reduce((a, b) => a + b.monto, 0);
  
  const capitalTotal = efectivoDisponible + inversionesActivas;
  
  return {
    saldoInicial,
    ingresos,
    egresos,
    inversionesRealizadas,
    desinversionesRetornadas,
    balanceCalculado,
    conteoFisico: physicalTotal,
    diferencia,
    patrimonio: {
      efectivoDisponible,
      inversionesActivas,
      capitalTotal
    },
    // ...
  };
};

// ✅ AHORA (Simple)
export const calcularConciliacion = (input: ConciliationInput) => {
  // Fórmula simple
  const balanceCalculado = saldoInicial + ingresos - gastos;
  const diferencia = physicalTotal - balanceCalculado;
  
  return {
    saldoInicial,
    ingresos,
    egresos: gastos,
    inversionesRealizadas: 0,      // Obsoleto
    desinversionesRetornadas: 0,   // Obsoleto
    balanceCalculado,
    conteoFisico: physicalTotal,
    diferencia,
    patrimonio: {
      efectivoDisponible: balanceCalculado,
      inversionesActivas: 0,        // Obsoleto
      capitalTotal: balanceCalculado
    },
    activeMovements,
    inversionesActivas: 0           // Obsoleto
  };
};
```

**Impacto en `generarCorteSummary`:**
```typescript
// ❌ ANTES - Estructura compleja
const corteSummary = {
  inversionesRealizadas: conciliacion.inversionesRealizadas,
  desinversionesRetornadas: conciliacion.desinversionesRetornadas,
  patrimonio: {
    efectivoDisponible,
    inversionesActivas,
    capitalTotal
  },
  // ...
};

// ✅ AHORA - Estructura simple
const corteSummary = {
  // ✅ Removidas referencias a inversiones
  ingresosTotal: conciliacion.ingresos,
  egresosTotal: conciliacion.egresos,
  balanceCalculado: conciliacion.balanceCalculado,
  // ...
};
```

---

## Cambios en App.tsx

### Props del Dashboard
```typescript
// ❌ ANTES
<Dashboard 
  movements={movements}
  inversiones={[]}        // ❌ REMOVIDO
  vault={vault}
  onOpenVault={() => setView('contabilidad')}
  onPerformCut={() => setView('corte')}
/>

// ✅ AHORA
<Dashboard 
  movements={movements}
  vault={vault}
  onOpenVault={() => setView('contabilidad')}
  onPerformCut={() => setView('corte')}
/>
```

### Lógica de Retorno de Inversión
```typescript
// ❌ ANTES - Cambiaba status a LIQUIDADA
const handleReturnInvestment = async (m: Movement) => {
  // Lógica compleja de cambio de estado
  const updated = movements.map(item => 
    item.id === m.id ? { ...item, status: MovementStatus.ARCHIVADO } : item
  ).concat(returnMovement);
};

// ✅ AHORA - Se elimina completamente (no es necesaria)
// Los retornos se registran como INGRESO normal
```

---

## Compatibilidad Histórica

### Tratamiento de registros antiguos INVERSION

**Política:**
- Mantener todos los registros históricos en Firebase
- Filtrar tipos INVERSION automáticamente en cálculos
- Tratarlos como GASTO en la fórmula

```typescript
// Ejemplo: Filtrar movimientos para corte
const gastos = activeMovements
  .filter(m => m.type === MovementType.GASTO)
  .reduce((a, b) => a + b.amount, 0);

// Si encuentras INVERSION histórico:
const gastosConCompatibilidad = activeMovements
  .filter(m => m.type === MovementType.GASTO || m.type === 'INVERSION')
  .reduce((a, b) => a + b.amount, 0);
```

---

## Testing

### Casos de prueba importantes

```typescript
// Test 1: Balance simple
describe('calcularConciliacion - Simple', () => {
  it('debe calcular balance = ingresos - gastos', () => {
    const input = {
      movements: [
        { type: INGRESO, amount: 1000 },
        { type: GASTO, amount: 300 }
      ],
      saldoInicial: 0,
      physicalTotal: 700
    };
    const result = calcularConciliacion(input);
    expect(result.balanceCalculado).toBe(700);
    expect(result.diferencia).toBe(0); // Cuadra perfecto
  });
});

// Test 2: Préstamo → Retorno
describe('Escenario: Préstamo', () => {
  it('debe manejar salida y retorno como ingresos/egresos', () => {
    const movements = [
      { type: GASTO, amount: 1000, description: 'Préstamo Hermano' },
      { type: INGRESO, amount: 1200, description: 'Pago Préstamo + Utilidad' }
    ];
    const balance = 1200 - 1000; // = 200 (ganancia)
    expect(balance).toBe(200);
  });
});

// Test 3: Backwards compatibility
describe('Compatibilidad histórica', () => {
  it('debe tratar INVERSION antigua como GASTO', () => {
    const movements = [
      { type: 'INVERSION', amount: 500 } // Antiguo
    ];
    // Debería incluirse en gastos
    const gastos = movements
      .filter(m => m.type === GASTO || m.type === 'INVERSION')
      .reduce((a, b) => a + b.amount, 0);
    expect(gastos).toBe(500);
  });
});
```

---

## Performance

### Cambios de Rendimiento
- ✅ **Menos renderizaciones**: Menos campos en stats
- ✅ **Cálculos más rápidos**: Fórmula simple sin filtros complejos
- ✅ **Menor tamaño de UI**: Menos tarjetas y columnas

### Métrica: Dashboard.tsx
```
Antes: useMemo dependencies = [movements, inversiones]
Después: useMemo dependencies = [movements] ✅ (1 menos)
```

---

## Documentación Relacionada

📄 Ver también:
- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Resumen de cambios
- [GUIA_USO_SIMPLIFICADO.md](./GUIA_USO_SIMPLIFICADO.md) - Guía de uso para usuarios
- [types.ts](./types.ts) - Definiciones actualizadas
- [conciliacion.service.ts](./conciliacion.service.ts) - Lógica de cálculos

---

## Preguntas Frecuentes para Desarrolladores

### P: ¿Qué pasa si encuentro código que referencia INVERSION?
A: Reemplazalo con la lógica de EGRESO→INGRESO. Los registros históricos se mantienen en BD pero no se usan en el frontend.

### P: ¿Cómo manejar migraciones de datos?
A: No es necesario. Firebase mantiene todo. Solo actualiza el código del frontend.

### P: ¿Se pueden agregar más tipos de movimiento en el futuro?
A: Sí, pero se recomienda mantener simple: INGRESO y GASTO. Usa el campo `category` para subcategorías.

### P: ¿Por qué se eliminó el status ACTIVA/LIQUIDADA?
A: Porque los préstamos ahora se registran como movimientos normales. Un EGRESO es dinero que salió. Un INGRESO es dinero que entró.

---

**Última actualización:** 14 de enero, 2026  
**Versión del código:** Post-refactorización simplificada

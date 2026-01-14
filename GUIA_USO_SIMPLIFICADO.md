# 🎯 Guía de Uso - YuJoFintech Simplificado

## Sistema de Ingresos y Gastos

Después de la refactorización, YuJoFintech ahora funciona con una lógica simple y directa:

### Fórmula Principal
```
DINERO DISPONIBLE EN CAJA = INGRESOS TOTALES - GASTOS TOTALES
```

---

## 📝 Ejemplos Prácticos

### Ejemplo 1: Venta Normal

**Situación**: Vendes un producto por $500

**Acción:**
1. Abre la app → **Registrar**
2. Protocolo: `INGRESO`
3. Concepto: `"Venta Producto X"`
4. Monto: `$500`
5. Responsable: `Josué`
6. ✅ **Resultado**: Caja +$500

**En el Dashboard:**
- Ingresos: $500 ↑
- Balance: +$500

---

### Ejemplo 2: Gasto Operativo

**Situación**: Compras suministros por $200

**Acción:**
1. Abre la app → **Registrar**
2. Protocolo: `EGRESO`
3. Concepto: `"Compra de Suministros"`
4. Monto: `$200`
5. Responsable: `Josué`
6. ✅ **Resultado**: Caja -$200

**En el Dashboard:**
- Egresos: $200 ↑
- Balance: -$200

---

### Ejemplo 3: Préstamo a un Familiar (TU HERMANO)

#### Paso 1: Tu hermano te pide $1,000

**Situación**: Tu hermano necesita dinero, le prestas $1,000 de tu caja

**Acción:**
1. Registrar → Protocolo: `EGRESO`
2. Concepto: `"Préstamo Hermano - Salida de Dinero"`
3. Monto: `$1,000`
4. ✅ **Caja baja**: -$1,000

```
Dinero Físico antes: $5,000
Dinero Físico después: $4,000
```

**¿Por qué es EGRESO y no "Inversión"?**
- Porque el dinero SALIÓ de tu caja
- Tu hermano tiene el dinero físico
- Se espera que tu caja tenga $1,000 menos

---

#### Paso 2: Tu hermano devuelve el dinero + ganancias

**Situación**: 1 mes después, tu hermano te devuelve $1,200 ($1,000 + $200 de ganancia)

**Acción:**
1. Registrar → Protocolo: `INGRESO`
2. Concepto: `"Pago Préstamo + Utilidad por tu hermano"`
3. Monto: `$1,200`
4. ✅ **Caja sube**: +$1,200

```
Dinero Físico antes: $4,000
Dinero Físico después: $5,200
Ganancia neta: $200
```

**¿Cómo se ve en el Dashboard?**
- Ingresos: +$1,200
- Gastos: $1,000 (del mes anterior)
- Balance: +$200 (tu ganancia)

---

### Ejemplo 4: Corte de Caja (Arqueo)

**Situación**: Es fin de turno, necesitas conciliar saldos

**Movimientos del turno:**
```
Ingresos:
- Venta 1: $500
- Venta 2: $300
- Pago Préstamo: $1,200
Total Ingresos: $2,000

Gastos:
- Compra Suministros: $200
- Pago Servicios: $150
- Préstamo Hermano: $1,000
Total Gastos: $1,350

Balance Calculado = $2,000 - $1,350 = $650
```

**En la pantalla de "Corte de Caja":**
```
┌─────────────────────────────────────┐
│ Ingresos: $2,000 (Verde)            │
│ Egresos: $1,350 (Rojo)              │
│ Balance Calculado: $650             │
└─────────────────────────────────────┘

Conteo Físico: $650
✓ CUADRE PERFECTO
```

**Validación:**
- Si en el cajón hay físicamente $650 → ✅ TODO CUADRA
- Si hay $700 → ⚠ SOBRANTE de $50
- Si hay $600 → ⚠ FALTANTE de $50

---

## 🏦 Categorías Recomendadas para EGRESO

Ya no existe "Inversión" como tipo, pero puedes usar categorías en los egresos:

```
Egresos pueden ser:
- Préstamo (Dinero que sale pero puede volver)
- Gasto Operativo (Suministros, servicios)
- Pago Personal (Tu sueldo, retiros)
- Inversión Temporal (Para diferenciar del gasto normal)
```

**Ejemplo de nota:**
```
Protocolo: EGRESO
Concepto: "[PRÉSTAMO] $1,000 a tu hermano"
Monto: $1,000
```

Así sabes que es un préstamo cuando lo lees después.

---

## 📊 Comparación: Antes vs Después

### Escenario: Tu hermano debe dinero

#### ANTES (Sistema Complejo)
```
Día 1: Registras como INVERSION (Dinero en la calle, no está en caja)
       Caja: No se reduce inmediatamente
       Patrimonio: Caja + Inversiones Activas

Día 30: Hermano paga, cambias estado a LIQUIDADA
        Registras como RETORNO (Desinversión)
        Caja: Se actualiza
```
❌ Complejo, confuso, 2 pasos

#### AHORA (Sistema Simple)
```
Día 1: Registras como EGRESO ($1,000 sale de caja)
       Caja: Se reduce inmediatamente
       Balance: Actualizado

Día 30: Hermano paga, registras como INGRESO
        Caja: Sube
        Balance: Se calcula automáticamente
```
✅ Simple, intuitivo, inmediato

---

## 🔍 Validación Rápida

**Antes del Corte de Caja, pregúntate:**

| Pregunta | Respuesta | Tipo |
|----------|-----------|------|
| ¿Entró dinero a la caja? | Sí | INGRESO |
| ¿Salió dinero de la caja? | Sí | EGRESO |
| ¿El dinero está físicamente en el cajón? | No siempre | - |
| ¿Es un préstamo? | Está en EGRESO concepto | EGRESO |
| ¿Es un retorno de préstamo? | Está en INGRESO concepto | INGRESO |

---

## 💾 Datos en Firebase

Todos tus registros se guardan así:

```typescript
{
  id: "YJ-ABC123",
  type: "INGRESO", // o "GASTO"
  amount: 1200,
  description: "Pago Préstamo + Utilidad",
  responsible: "Josué",
  date: "2026-01-14",
  status: "PENDIENTE_CORTE" // Se archiva después del corte
}
```

**NO hay más campo `inversiones`, `estado`, `tasaInteres`, etc.**
✅ Más simple, más limpio

---

## ⚠️ Notas Importantes

1. **El dinero sale hoy, vuelve mañana** → Mismo resultado a fin de mes
   - Préstamo hoy: EGRESO de $1,000
   - Retorno mañana: INGRESO de $1,200
   - Neto: Balance sube $200 (tu ganancia)

2. **Los cortes son definitivos** → Después del corte, no puedes editar esos movimientos
   - Se archivan automáticamente
   - Nuevo ciclo empieza con nuevo saldo inicial

3. **El físico manda** → Si el corte no cuadra
   - Verifica en la tabla de movimientos
   - Revisa el conteo físico en la bóveda
   - El sistema te muestra la diferencia exacta

---

## 🎓 Resumen Mental

**Cuando registres movimientos, piensa:**

- **INGRESO**: 💵 Dinero entra a mis manos/caja
- **EGRESO**: 💸 Dinero sale de mis manos/caja

Así de simple. Sin "inversiones en la calle", sin "capital pendiente", sin estados complejos.

**Todo es: entra, sale, y al final del día contamos lo que queda. ✅**

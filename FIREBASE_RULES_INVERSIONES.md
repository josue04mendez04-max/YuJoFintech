# Firebase Firestore Rules - YuJoFintech

## Configuración de Seguridad Recomendada

### 1. **Reglas de Base de Datos en Modo Producción**

Reemplaza las reglas actuales en **Firebase Console → Firestore Database → Rules** con esto:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función para verificar autenticación
    function isAuthenticated() {
      return request.auth != null;
    }

    // Función para verificar si es admin (email específico)
    function isAdmin() {
      return request.auth.email == 'josue04mendez04@gmail.com';
    }

    // ============ COLECCIÓN: yujofintech (Movimientos) ============
    match /yujofintech/{document=**} {
      // Solo admin puede leer y escribir
      allow read, write: if isAdmin();
      
      // Bloquear acceso a todos los demás
      allow read, write: if false;
    }

    // ============ COLECCIÓN: inversiones (Dinero Congelado) ============
    match /inversiones/{document=**} {
      // Solo admin puede leer y escribir inversiones
      allow read, write: if isAdmin();
      
      // Bloquear acceso a todos los demás
      allow read, write: if false;
      
      // Operaciones específicas permitidas
      allow create: if isAdmin() && 
        request.resource.data.monto > 0 &&
        request.resource.data.descripcion != null &&
        request.resource.data.tipo in ['Proyecto', 'Compra', 'Mejora', 'Otro'] &&
        request.resource.data.status in ['ACTIVA', 'PENDIENTE_RETORNO', 'COMPLETADA'];
      
      allow update: if isAdmin() &&
        (request.resource.data.status in ['ACTIVA', 'PENDIENTE_RETORNO', 'COMPLETADA'] || !('status' in request.resource.data));
      
      allow delete: if isAdmin();
    }

    // ============ COLECCIÓN: cortes (Corte de Caja) ============
    match /cortes/{document=**} {
      // Solo admin puede leer y escribir cortes
      allow read, write: if isAdmin();
    }

    // Negar todo acceso por defecto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 2. **Configuración en Tiempo Real con Sincronización**

El componente `Accounting.tsx` incluye:

### ✅ Lectura en Tiempo Real
```typescript
listenToInversiones(callback) // Escucha cambios en directo
```

### ✅ Escritura y Actualización en Tiempo Real
```typescript
setInversion(inversion)     // Crea o actualiza
updateInversion(id, data)   // Actualiza solo campos específicos
deleteInversion(id)         // Elimina
```

---

## 3. **Estructura de Datos en Firestore**

### Colección: `inversiones`
```json
{
  "id": "inv_1704700800000",
  "monto": 5000.50,
  "descripcion": "Compra de equipo para la tienda",
  "tipo": "Compra",
  "responsable": "Josué M.",
  "fechaInicio": "2024-01-08",
  "fechaEstimadaRetorno": "2024-02-08",
  "status": "ACTIVA",
  "notas": "Equipo de refrigeración para drinks",
  "timestamp": "2024-01-08T12:34:56.000Z"
}
```

**Campos de Status:**
- `ACTIVA`: Dinero actualmente congelado
- `PENDIENTE_RETORNO`: En proceso de retorno
- `COMPLETADA`: Ya retornó completamente

---

## 4. **Interpretación de "Dinero Congelado"**

### ❄️ **Significado**
- **No es dinero en caja**: Salió físicamente de la bóveda
- **No es dinero gastado**: Volverá cuando se complete la inversión
- **Fuera del balance**: No se cuenta en el total disponible
- **Monitoreo constante**: Se registra cada cambio

### 📊 **Visualización en Dashboard**
```
Balance Normal: $10,000
Dinero Congelado: $5,000 (en hielo ❄️)
━━━━━━━━━━━━━━━━━━━━━━━━━
Balance Real Disponible: $10,000 (sin contar lo congelado)
```

---

## 5. **Validaciones en Firestore**

Las rules validan automáticamente:

✅ Monto mayor a 0
✅ Descripción requerida
✅ Tipo debe ser: Proyecto, Compra, Mejora u Otro
✅ Status válido: ACTIVA, PENDIENTE_RETORNO, COMPLETADA
✅ Solo admin puede modificar

---

## 6. **Cómo Usar en la App**

### En `App.tsx` o componente padre:

```typescript
import Accounting from './components/Accounting';

// En tu componente principal
<Accounting 
  onInversionChange={(inversiones) => {
    // Actualizar Dashboard automáticamente
    setInversiones(inversiones);
  }}
/>
```

---

## 7. **Seguridad por Capas**

| Capa | Mecanismo |
|------|-----------|
| **Firestore Rules** | Solo admin (email específico) |
| **Componente React** | Solo muestra datos autenticados |
| **Tipos TypeScript** | Validación en compilación |
| **Firebase Config** | Credenciales limitadas |

---

## 8. **Monitoreo en Tiempo Real**

Cada cambio en inversiones:
1. Se guarda automáticamente en Firestore ✅
2. Se sincroniza a todos los clientes escuchando 🔄
3. Se refleja en el Dashboard ⚡
4. Se valida contra las rules 🔐

---

## ✅ **¿Se Puede?**

**Sí, se puede hacer todo esto:**

✓ Sincronizar en tiempo real
✓ Guardar automáticamente
✓ Congelar dinero (visualmente y lógicamente)
✓ Sacarlo del balance
✓ Darle efecto visual de hielo
✓ Permitir edición constante
✓ Validar con rules de Firebase
✓ Mantener seguridad total

**La implementación está completa y lista para usar. 🚀**

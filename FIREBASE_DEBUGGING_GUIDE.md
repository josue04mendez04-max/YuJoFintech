# 🔧 Guía de Debugging - Firebase Connection

## Problemas Comunes y Soluciones

---

## 1. ❌ Error: "Permission denied"

**Síntoma**: Ves este error en la consola:
```
Error: Missing or insufficient permissions.
```

**Causa**: Las Firestore Security Rules no permiten tu operación.

**Solución**:
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Proyecto: `easyrep-a1`
3. Firestore → Pestaña "Rules"
4. Asegúrate que las reglas incluyan:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /yujofintech/{document=**} {
      allow read, write: if request.auth != null;
      // O para desarrollo:
      // allow read, write: if true;
    }
  }
}
```

5. Haz clic en "Publish"

---

## 2. ❌ Error: "Firebase is not initialized"

**Síntoma**: Error en la consola durante carga

**Causa**: Firebase no se inicializó correctamente

**Verificación**:
```bash
# En la consola del navegador (F12):
console.log(firebase)  // Debería mostrar el objeto firebase
```

**Solución**:
```typescript
// En firebase.config.ts, verifica:
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = { ... };
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

---

## 3. ⏱️ Los datos no se sincronizan

**Síntoma**: Subes datos pero no aparecen en Firestore

**Checklist**:

✅ **Verificar syncStatus**:
```typescript
// En App.tsx, el estado debe cambiar:
'syncing' → 'synced'

Si ves 'error', el lastSyncError te dirá qué pasó
```

✅ **Verificar en Firebase Console**:
1. Console Firebase → proyecto `easyrep-a1`
2. Firestore → Colección `yujofintech`
3. Los documentos deberían aparecer aquí

✅ **Verificar Network**:
1. Abre DevTools (F12)
2. Pestaña Network
3. Filtra por "firestore"
4. Si no ves requests, Firebase no está intentando conectar

✅ **Verificar logs**:
```javascript
// Deberías ver en consola:
"YuJo: Sincronización exitosa con Firebase Firestore."
```

---

## 4. 🐌 Las consultas son lentas

**Síntoma**: Tarda mucho en cargar los movimientos

**Soluciones**:

### a) Agregar índices a Firestore

1. Ve a Firebase Console
2. Firestore → Pestaña "Indexes"
3. Crea un índice para:
   - Colección: `yujofintech`
   - Campo: `date` (Descending)

### b) Implementar paginación

```typescript
// Modificar firestore.service.ts
export const fetchMovementsLimited = async (limit: number = 50) => {
  const movementsRef = collection(db, COLLECTION_NAME);
  const q = query(
    movementsRef, 
    orderBy('date', 'desc'),
    limit(limit)  // ← Limitar resultados
  );
  const querySnapshot = await getDocs(q);
  // ...
};
```

### c) Importar limit correctamente

```typescript
import { limit } from 'firebase/firestore';
```

---

## 5. 🔐 Validar que los datos se guardan correctamente

**Script de validación manual**:

```javascript
// En la consola del navegador (F12), después de crear un movimiento:

const db = firebase.firestore();
db.collection('yujofintech').orderBy('date', 'desc').limit(1).get().then(snap => {
  snap.forEach(doc => {
    console.log('Último movimiento:', doc.data());
  });
});
```

---

## 6. 🔄 Forzar sincronización

**Si necesitas actualizar manualmente**:

```typescript
// En App.tsx, en la consola del navegador:
// (Después de haber ejecutado la app)

window.location.reload();  // Recarga la página
```

O programáticamente:
```typescript
// En App.tsx
const [refreshKey, setRefreshKey] = useState(0);

const manualSync = useCallback(() => {
  setRefreshKey(prev => prev + 1);
  fetchMovements();
}, [fetchMovements]);

return (
  <button onClick={manualSync}>
    🔄 Sincronizar ahora
  </button>
);
```

---

## 7. 📊 Ver estadísticas de conexión

**Agregar logging mejorado**:

```typescript
// En App.tsx, modifica fetchMovements():

const fetchMovements = useCallback(async () => {
  setIsLoading(true);
  setSyncStatus('syncing');
  const startTime = performance.now();
  
  try {
    const data = await FirestoreService.fetchMovements();
    const duration = performance.now() - startTime;
    
    setMovements(data);
    setSyncStatus('synced');
    
    console.log('📊 Estadísticas:');
    console.log(`   ✓ Movimientos: ${data.length}`);
    console.log(`   ✓ Tiempo: ${duration.toFixed(2)}ms`);
    console.log(`   ✓ Última sincronización: ${new Date().toLocaleTimeString()}`);
  } catch (err: any) {
    setSyncStatus('error');
    setLastSyncError(err.message);
    console.error('❌ Error:', err);
  } finally {
    setIsLoading(false);
  }
}, []);
```

---

## 8. 🧪 Probar operaciones individuales

**En la consola del navegador** (después de iniciar la app):

```javascript
// Importa el servicio (si está disponible globalmente)
// O prueba directamente contra Firestore:

const db = firebase.firestore();

// Crear documento
db.collection('yujofintech').add({
  type: 'INGRESO',
  amount: 1000,
  description: 'Prueba manual',
  date: new Date().toISOString(),
  responsible: 'Test',
  authorization: 'TEST',
  status: 'PENDIENTE_CORTE'
}).then(ref => {
  console.log('✅ Documento creado:', ref.id);
}).catch(err => {
  console.error('❌ Error:', err);
});
```

---

## 9. 🌐 Verificar conectividad

**Pasos**:

1. Abre DevTools (F12)
2. Pestaña Network
3. Aplica filtro "firestore" o "googleapis"
4. Realiza una acción en la app
5. Deberías ver requests como:
   - `firestore.googleapis.com`
   - Status: `200` (exitoso)
   - Response: contiene `"docs"` o datos

Si no ves ningún request:
- ❌ Firebase no está conectando
- Revisa firebase.config.ts
- Revisa los Security Rules

---

## 10. 📝 Habilitar logging detallado

```typescript
// Al inicio de index.tsx o App.tsx

import { enableLogging } from 'firebase/firestore';

// Habilita logs de Firestore (para desarrollo)
if (process.env.NODE_ENV === 'development') {
  enableLogging(true);
}
```

---

## 📋 Checklist Final

Antes de reportar un bug, verifica:

- [ ] El API Key en firebase.config.ts es correcto
- [ ] El Project ID es `easyrep-a1`
- [ ] Las Firestore Security Rules permiten lectura/escritura
- [ ] Hay conexión a internet
- [ ] No hay errores de red en DevTools
- [ ] Los logs en consola muestran "Sincronización exitosa"
- [ ] Los documentos aparecen en Firebase Console
- [ ] El navegador es moderno (Chrome, Firefox, Safari, Edge)

---

## 🆘 Si nada funciona

1. **Abre la consola** (F12)
2. **Copia el error completo**
3. **Ve a Firebase Console** y verifica:
   - Que el proyecto existe
   - Que Firestore está habilitado
   - Que tienes datos en la colección `yujofintech`

4. **Reinicia todo**:
   ```bash
   npm install
   npm run dev
   ```

5. **Limpia caché**:
   - Ctrl+Shift+Delete (en Chrome)
   - Limpia cookies y caché del sitio

---

*Última actualización: 8 de enero de 2026*

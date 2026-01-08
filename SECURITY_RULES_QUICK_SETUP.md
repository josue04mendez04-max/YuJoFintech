# 🔐 Security Rules - Guía Rápida

## ⚡ Opción Recomendada AHORA (Desarrollo)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /yujofintech/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### ✅ Qué permite:
- ✅ Leer cualquier documento
- ✅ Crear nuevos movimientos
- ✅ Actualizar movimientos
- ✅ Eliminar movimientos
- ✅ Operaciones batch (corte)

### ⚠️ Quién puede acceder:
- ✅ TÚ (desarrollo local)
- ⚠️ Cualquiera con acceso a la DB (no es seguro en producción)

---

## 📋 Pasos para Aplicar (3 pasos)

### Paso 1: Abre Firebase Console
```
https://console.firebase.google.com
→ Proyecto: easyrep-a1
```

### Paso 2: Ve a Firestore Rules
```
En la izquierda:
Firestore Database → Pestaña "Rules"
```

### Paso 3: Reemplaza el código
```
1. Selecciona TODO (Ctrl+A)
2. Borra
3. Pega el código de arriba
4. Haz clic en "Publish" (abajo a la derecha)
```

---

## 🎯 ¿Cuál usar?

| Situación | Regla | Código |
|-----------|-------|--------|
| **Desarrollo local** | Development | `allow read, write: if true;` |
| **Con autenticación** | Production | `allow read, write: if request.auth != null;` |
| **Máxima seguridad** | Validated | Con validación de campos |

---

## ✅ Cómo verificar que funciona

Después de publicar, copia esto en la consola (F12) y ejecuta:

```javascript
firebase.firestore()
  .collection('yujofintech')
  .limit(1)
  .get()
  .then(snap => console.log('✅ Lectura OK:', snap.size, 'documentos'))
  .catch(err => console.error('❌ Error:', err.code, err.message));
```

Deberías ver: `✅ Lectura OK: X documentos`

---

## 🚨 Lo que NECESITAS SABER

### La regla `if true` significa:
```
✅ PERMITE todo
❌ NO hay restricción
⚠️ SOLO usar en desarrollo
```

### Cuando pases a producción:
```
Cambia a: if request.auth != null
Esto requiere que los usuarios se logueen
```

### Si compartes la DB:
```
La colección 'yujofintech' será accesible para todas las apps
que usen el mismo Project ID (easyrep-a1)
```

---

## 📁 Archivos Relacionados

- `FIREBASE_SECURITY_RULES.md` - Guía completa con 4 opciones
- `firebase-security-rules.json` - Reglas en formato JSON

---

**¿Hecho?** Ahora tu app debería funcionar sin problemas de permisos.

Si ves error "Permission denied", es porque las reglas no están publicadas correctamente.

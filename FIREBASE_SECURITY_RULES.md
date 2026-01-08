# Firebase Firestore Security Rules

Las siguientes son las reglas que debes agregar en Firebase Console para que YuJoFintech tenga permisos de lectura y escritura.

## 📋 Cómo aplicar estas reglas:

1. Ve a: https://console.firebase.google.com
2. Selecciona el proyecto: **easyrep-a1**
3. En la izquierda: Firestore Database → **Rules**
4. Reemplaza todo el contenido con las reglas de abajo
5. Haz clic en **Publish**

---

## ✅ OPCIÓN 1: Desarrollo (Sin Autenticación - MÁS PERMISIVO)

Usa esto si estás en desarrollo y quieres que cualquiera pueda leer/escribir:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección: yujofintech
    // Permisos: Lectura y escritura completa
    match /yujofintech/{document=**} {
      allow read, write: if true;
    }
    
  }
}
```

---

## ⭐ OPCIÓN 2: Producción (CON Autenticación - MÁS SEGURO)

Usa esto si tienes autenticación implementada:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección: yujofintech
    // Permisos: Solo usuarios autenticados
    match /yujofintech/{document=**} {
      allow read, write: if request.auth != null;
    }
    
  }
}
```

---

## 🔒 OPCIÓN 3: Mixta (Desarrollo + Producción)

Usa esto si necesitas soportar ambos modos:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección: yujofintech
    match /yujofintech/{document=**} {
      // Permite lectura/escritura en desarrollo
      // O si está autenticado en producción
      allow read, write: if 
        request.auth != null ||
        request.headers['x-environment'] == 'development';
    }
    
  }
}
```

---

## 🛡️ OPCIÓN 4: Restrictiva (Validación completa)

Usa esto si quieres máxima seguridad con validación:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección: yujofintech
    match /yujofintech/{docId} {
      
      // LECTURA: Solo usuarios autenticados
      allow read: if request.auth != null;
      
      // ESCRITURA: Solo si valida estructura
      allow create: if 
        request.auth != null &&
        request.resource.data.type in ['INGRESO', 'GASTO', 'INVERSION'] &&
        request.resource.data.amount is number &&
        request.resource.data.amount > 0 &&
        request.resource.data.description is string &&
        request.resource.data.status in ['PENDIENTE_CORTE', 'EN_CURSO', 'ARCHIVADO'];
      
      // ACTUALIZACIÓN: Validar cambios
      allow update: if 
        request.auth != null &&
        (request.resource.data.status in ['PENDIENTE_CORTE', 'EN_CURSO', 'ARCHIVADO']);
      
      // ELIMINACIÓN: Solo admin
      allow delete: if 
        request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
  }
}
```

---

## 📝 RECOMENDACIÓN

Para **YuJoFintech** recomiendo:

### Ahora (Desarrollo):
Usa **OPCIÓN 1** (sin autenticación):
```javascript
allow read, write: if true;
```

### Luego (Cuando agregues autenticación):
Usa **OPCIÓN 2** (con autenticación):
```javascript
allow read, write: if request.auth != null;
```

### Cuando esté lista (Producción):
Usa **OPCIÓN 4** (con validación completa)

---

## ✅ Pasos para aplicar:

1. **Copia una de las opciones de arriba**
2. **Ve a https://console.firebase.google.com**
3. **Proyecto: easyrep-a1**
4. **Firestore Database**
5. **Pestaña: Rules**
6. **Pega el código**
7. **Haz clic en: Publish**

---

## 🧪 Verificar que funciona:

Después de publicar, ejecuta en la consola del navegador:

```javascript
firebase.firestore()
  .collection('yujofintech')
  .add({
    type: 'INGRESO',
    amount: 100,
    description: 'Test',
    responsible: 'Test',
    authorization: 'Test',
    date: new Date().toISOString(),
    status: 'PENDIENTE_CORTE'
  })
  .then(() => console.log('✅ Escritura funcionando'))
  .catch(err => console.error('❌ Error:', err));
```

Si ves `✅ Escritura funcionando`, las reglas están correctas.

---

## ⚠️ Importancia de las Security Rules

Las Security Rules **son tu firewall de Firestore**. Sin ellas:
- ❌ Cualquiera podría eliminar todos tus datos
- ❌ Otras apps podrían escribir en tu base de datos
- ❌ No hay protección contra bots

Con ellas:
- ✅ Solo tú puedes acceder (desarrollo)
- ✅ Solo usuarios autenticados (producción)
- ✅ Validación de estructura de datos

---

*Documento generado: 8 de enero de 2026*

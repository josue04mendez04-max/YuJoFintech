# 🎬 INSTRUCCIONES PASO A PASO - Aplicar Security Rules

## 📸 Guía Visual

---

## PASO 1: Abre Firebase Console

### URL:
```
https://console.firebase.google.com
```

### Deberías ver:
```
┌─────────────────────────────────┐
│  My Projects                    │
│  ☐ easyrep-a1  ← HAZ CLIC AQUÍ │
│  ☐ Otros proyectos             │
└─────────────────────────────────┘
```

---

## PASO 2: Busca Firestore Database

Después de entrar al proyecto, en la izquierda busca:

```
┌─ Build
│  ├─ Authentication
│  ├─ Firestore Database  ← HAZ CLIC AQUÍ
│  ├─ Realtime Database
│  └─ Storage
└─ ...
```

---

## PASO 3: Ve a la Pestaña "Rules"

Arriba en Firestore verás:

```
┌─────────────────────────────────┐
│ Data | Rules | Indexes | Backups│
│      │  ↑                        │
│      └── HAZ CLIC AQUÍ           │
└─────────────────────────────────┘
```

---

## PASO 4: Ves el Editor de Reglas

Deberías ver algo como:

```
┌──────────────────────────────────────┐
│  Firestore Rules Editor               │
│                                      │
│ rules_version = '2';                │
│ service cloud.firestore {            │
│   match /databases/{database}/...   │
│   ...                                │
│                                      │
│ [X] Publish  [◻] Cancel             │
└──────────────────────────────────────┘
```

---

## PASO 5: Selecciona TODO el código

En el editor:
- Haz: **Ctrl+A** (Windows/Linux)
- O: **Cmd+A** (Mac)

Todo el código se pondrá azul (seleccionado)

---

## PASO 6: Borra el código actual

Presiona **Delete** o **Backspace**

Ahora está vacío:
```
┌──────────────────────────────────────┐
│                                      │
│ ← Acá está vacío                    │
│                                      │
└──────────────────────────────────────┘
```

---

## PASO 7: Copia el código nuevo

**COPIA EXACTAMENTE ESTO:**

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

---

## PASO 8: Pega el código en el editor

Haz clic dentro del editor y presiona:
- **Ctrl+V** (Windows/Linux)
- **Cmd+V** (Mac)

Ahora verás:

```javascript
┌──────────────────────────────────────┐
│ rules_version = '2';                │
│ service cloud.firestore {            │
│   match /databases/{database}/docs..│
│     match /yujofintech/{document=**}│
│       allow read, write: if true;  │
│     }                                │
│   }                                  │
│ }                                    │
└──────────────────────────────────────┘
```

---

## PASO 9: Verifica que está bien

Deberías ver que:
- ✅ No hay líneas rojas (errores)
- ✅ El código se ve completo
- ✅ Dice "rules_version = '2'" al inicio

---

## PASO 10: Haz clic en PUBLISH

En la esquina inferior derecha:

```
┌──────────────────┐
│  [✕] Cancel      │
│  [✓] Publish  ← HAZ CLIC AQUÍ │
└──────────────────┘
```

---

## PASO 11: Espera a que se publique

Deberías ver:

```
🔄 Publishing rules...
```

Luego:

```
✅ Rules published successfully!
```

Si ves error, revisa que el código esté correcto.

---

## PASO 12: ¡LISTO! Verifica que funciona

Abre tu navegador con la app:
```
http://localhost:5173
```

Abre la consola (F12) y pega esto:

```javascript
firebase.firestore()
  .collection('yujofintech')
  .limit(1)
  .get()
  .then(() => {
    console.log('✅ ¡FUNCIONA! Las reglas están correctas');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  });
```

---

## ✅ Resultado Esperado

Si todo está bien, verás en la consola:

```
✅ ¡FUNCIONA! Las reglas están correctas
```

---

## ❌ Si algo falla

### Error 1: "Permission denied"
- ❌ Las reglas no se publicaron
- ✅ Vuelve al paso 10 y verifica que hayas hecho clic en PUBLISH
- ✅ Espera 10 segundos y recarga la página

### Error 2: "Collection not found"
- ❌ La colección aún no existe
- ✅ Crea un documento manualmente en Firebase Console
- ✅ O crea uno desde la app primero

### Error 3: El código no se ve bien
- ❌ Hay caracteres especiales o errores
- ✅ Borra todo y copia de nuevo más cuidadosamente

---

## 📋 Checklist

- [ ] Abrí Firebase Console
- [ ] Fui al proyecto easyrep-a1
- [ ] Abrí Firestore Database
- [ ] Hice clic en la pestaña "Rules"
- [ ] Seleccioné todo el código (Ctrl+A)
- [ ] Borré el código
- [ ] Copié el código nuevo
- [ ] Pegué el código (Ctrl+V)
- [ ] El código se ve correcto
- [ ] Hice clic en PUBLISH
- [ ] Esperé el mensaje de éxito
- [ ] Probé en la consola del navegador
- [ ] Vi ✅ ¡FUNCIONA!

---

## 🎉 COMPLETADO

Si llegaste aquí, tu Firebase está configurado correctamente.

La app ahora puede:
- ✅ Leer datos
- ✅ Escribir datos
- ✅ Actualizar datos
- ✅ Eliminar datos
- ✅ Hacer transacciones (corte)

---

*Guía completada: 8 de enero de 2026*

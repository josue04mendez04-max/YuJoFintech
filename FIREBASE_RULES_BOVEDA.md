# ✅ Firebase Rules para Bóveda - Copiar en Firebase Console

## 📍 Dónde van
Firestore Database → Rules (solapa) → Copiar y pegar esto:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
      
          // Función para verificar autenticación
              function isAuthenticated() {
                    return request.auth != null;
                        }

                            // Función para verificar si es admin (tu email)
                                function isAdmin() {
                                      return request.auth.email == 'josue04mendez04@gmail.com';
                                          }

                                              // ============ COLECCIÓN: yujofintech (Movimientos) ============
                                                  match /yujofintech/{document=**} {
                                                        allow read, write: if isAdmin();
                                                            }

                                                                // ============ COLECCIÓN: inversiones (Dinero Congelado) ============
                                                                    match /inversiones/{document=**} {
                                                                          allow read, write: if isAdmin();
                                                                              }

                                                                                  // ============ COLECCIÓN: vaultCounts (Conteo de Bóveda) ============
                                                                                      match /vaultCounts/{document=**} {
                                                                                            // Solo admin puede escribir el conteo
                                                                                                  allow read: if isAdmin();
                                                                                                        allow write: if isAdmin();
                                                                                                              
                                                                                                                    // Validaciones opcionales
                                                                                                                          allow create: if isAdmin() && 
                                                                                                                                  request.resource.data.bills != null &&
                                                                                                                                          request.resource.data.coins != null;
                                                                                                                                                
                                                                                                                                                      allow update: if isAdmin();
                                                                                                                                                          }

                                                                                                                                                              // ============ COLECCIÓN: cortes (Corte de Caja) ============
                                                                                                                                                                  match /cortes/{document=**} {
                                                                                                                                                                        allow read, write: if isAdmin();
                                                                                                                                                                            }

                                                                                                                                                                                // Negar todo lo demás por defecto
                                                                                                                                                                                    match /{document=**} {
                                                                                                                                                                                          allow read, write: if false;
                                                                                                                                                                                              }
                                                                                                                                                                                                }
                                                                                                                                                                                                }
```

---

## 🔑 Cambios requeridos en las rules

**Reemplaza:**
```javascript
return request.auth.email == 'josue04mendez04@gmail.com';
```

**Con tu email real de Firebase Authentication**, por ejemplo:
```javascript
return request.auth.email == 'tuemailreal@gmail.com';
```

---

## 📋 Estructura de datos que se guarda

Cuando clickeas "Sellar Bóveda", se sube esto a Firebase:

```json
{
  "bills": {
    "1000": 5,
    "500": 3,
    "200": 2,
    "100": 10,
    "50": 4,
    "20": 6
  },
  "coins": {
    "10": 2,
    "5": 3,
    "2": 5,
    "1": 10,
    "0.5": 8
  },
  "timestamp": "2024-01-08T15:30:45.123Z",
  "updatedAt": "2024-01-08T15:30:45.123Z"
}
```

Ubicación en Firestore:
```
vaultCounts/current
```

---

## ✅ Funcionalidades

### 1. **Guardar en tiempo real**
- Click en "Sellar Bóveda" → Se guarda en `vaultCounts/current`
- Sube: billetes, monedas, y timestamp

### 2. **Ver en otros dispositivos**
- Cualquier dispositivo que esté escuchando `vaultCounts/current` verá los cambios en tiempo real
- Usa `listenToVaultCount()` en firestore.service.ts

### 3. **Historial automático**
- Se actualiza el timestamp cada vez que guardas
- Puedes ver cuándo fue el último guardado

---

## 🚀 Pasos finales

1. **Ve a:** [Firebase Console](https://console.firebase.google.com/)
2. **Selecciona tu proyecto:** YuJoFintech
3. **Ve a:** Firestore Database → Rules
4. **Reemplaza** el contenido con las rules arriba (cambia el email)
5. **Publica** (botón Publish)
6. **Prueba:** Ingresa divisas en la Bóveda y haz click "Sellar Bóveda"

---

## 💡 Verificación

Para verificar que funciona:
- Abre Firestore Database
- Ve a la colección `vaultCounts`
- Deberías ver el documento `current` con tus datos de divisas
- Se actualiza cada vez que das click en "Sellar Bóveda"

✅ **¡Listo! Ahora tus divisas se sincronizan en todos tus dispositivos.**

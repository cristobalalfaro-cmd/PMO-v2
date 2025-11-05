# 🔧 Diagnóstico del Error "Error de red al guardar cambios"

Este error indica que el dashboard no puede comunicarse con Google Apps Script. Aquí está cómo resolverlo:

## Paso 1: Usar la Herramienta de Diagnóstico

1. Abre en tu navegador: **tu-url-de-replit.com/test_apps_script.html**
2. La herramienta automáticamente cargará la URL de tu Apps Script desde config.js
3. Haz clic en "Probar Conexión"
4. Lee el resultado para saber qué está fallando

## Paso 2: Verificar la URL del Apps Script

### ✓ Checklist de la URL:

1. **¿Actualizaste el código del Apps Script?**
   - Abre Google Sheets → Extensiones → Apps Script
   - Reemplaza el código con el de `scripts/apps_script_webapp_api.gs`
   - **Guarda el proyecto**

2. **¿Hiciste una nueva implementación?**
   - En Apps Script: Implementar → **Nueva implementación**
   - Tipo: Aplicación web
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
   - Copia la nueva URL

3. **¿Actualizaste la URL en config.js?**
   - Abre `data/config.js`
   - Pega la nueva URL en `gsUpdateUrl`
   - Debe verse así: `https://script.google.com/macros/s/AKfycby.../exec`

## Paso 3: Verificar Configuración del Apps Script

En el código de Apps Script, verifica:

```javascript
const CFG = {
  SHEET_ID: '',  // Deja vacío si el script está ligado a la hoja
  SHEET_NAME: 'Proyectos',  // ← Debe coincidir con el nombre de tu pestaña
  COL_ID: 'ID',
  API_KEY: ''
};
```

**Importante:** El nombre de `SHEET_NAME` debe ser **exactamente** el mismo que el nombre de la pestaña en tu Google Sheet.

## Paso 4: Verificar las Columnas

Tu Google Sheet debe tener estas columnas (en la primera fila):

- ID
- Tipo
- Cliente
- Proyecto
- Tareas
- Deadline
- Estatus
- Owner
- Email

## Paso 5: Probar Manualmente

### Opción A: Usar la herramienta de diagnóstico
1. Abre `test_apps_script.html`
2. Verifica que la URL esté correcta
3. Haz clic en "Probar Conexión"
4. Lee los errores específicos

### Opción B: Probar desde Apps Script
1. En el editor de Apps Script
2. Selecciona la función `doPost` en el menú
3. Haz clic en "Ejecutar"
4. Revisa los errores en la consola

## Errores Comunes y Soluciones

### Error: "URL no válida" o "Failed to fetch"
**Causa:** La URL del Apps Script no está desplegada correctamente
**Solución:** 
1. Ve a Apps Script
2. Implementar → Gestionar implementaciones
3. Verifica que haya una implementación activa
4. Copia la URL correcta (debe terminar en `/exec`)

### Error: "Respuesta no JSON" o "Login required"
**Causa:** Permisos incorrectos en la implementación
**Solución:**
1. Ve a Implementar → Gestionar implementaciones
2. Edita la implementación
3. "Quién tiene acceso" debe ser: **Cualquier persona**
4. Guarda y usa la nueva URL

### Error: "Hoja no encontrada"
**Causa:** El nombre de la hoja en CFG.SHEET_NAME no coincide
**Solución:**
1. Verifica el nombre exacto de tu pestaña en Google Sheets
2. Actualiza `SHEET_NAME` en el código de Apps Script
3. Guarda e implementa de nuevo

### Error: "Columna ID no encontrada"
**Causa:** Tu Google Sheet no tiene la columna ID
**Solución:**
1. Agrega una columna "ID" en tu Google Sheet
2. Asegúrate de que cada fila tenga un ID único

## Paso 6: Verificar en el Dashboard

1. Refresca el dashboard (Ctrl+F5 o Cmd+Shift+R)
2. Ingresa con la contraseña "Tomi.2016"
3. Haz clic en "Editar tareas"
4. Modifica un campo
5. Haz clic en "Guardar cambios"

**Si funciona:** Verás el mensaje "Cambios guardados correctamente"
**Si no funciona:** Anota el error exacto que aparece

## ¿Todavía no funciona?

Usa la herramienta de diagnóstico (test_apps_script.html) y comparte:
1. El status HTTP que muestra
2. La respuesta completa del servidor
3. El mensaje de error exacto

Con esa información puedo ayudarte a resolver el problema específico.

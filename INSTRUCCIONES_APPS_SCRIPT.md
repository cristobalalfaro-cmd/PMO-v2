# Instrucciones para Actualizar Google Apps Script

## Paso 1: Abrir el Editor de Apps Script

1. Abre tu Google Sheet vinculado al dashboard
2. Ve al menú: **Extensiones > Apps Script**
3. Se abrirá el editor de Apps Script en una nueva pestaña

## Paso 2: Actualizar el Código

1. En el editor de Apps Script, busca el archivo que contiene la función `doPost`
2. **REEMPLAZA TODO EL CÓDIGO** con el contenido del archivo `scripts/apps_script_webapp_api.gs` que está en este proyecto
3. El nuevo código permite actualizar múltiples campos: Tareas, Owner, Deadline y Estatus

## Paso 3: Configurar el Script

Asegúrate de que la configuración sea correcta:

```javascript
const CFG = {
  SHEET_ID: 'REEMPLAZA_CON_TU_SHEET_ID', // Opcional si el script está ligado a la hoja
  SHEET_NAME: 'Proyectos',               // Nombre de tu hoja (pestaña)
  COL_ID: 'ID',                          // Nombre de la columna ID
  API_KEY: ''                            // Opcional
};
```

**Nota:** Si tu Apps Script ya está ligado a la Google Sheet (bound script), puedes dejar `SHEET_ID` vacío. El nombre de la hoja debe coincidir exactamente con el nombre de la pestaña en tu Google Sheet.

## Paso 4: Guardar y Desplegar

1. Haz clic en **"Guardar proyecto"** (icono del disquete)
2. Ve a **Implementar > Nueva implementación**
3. Selecciona tipo: **Aplicación web**
4. Configuración:
   - Descripción: "API para actualizar tareas del dashboard"
   - Ejecutar como: **Yo** (tu cuenta)
   - Quién tiene acceso: **Cualquier persona** (o "Cualquier usuario con vínculo a Replit")
5. Haz clic en **"Implementar"**
6. **Copia la URL de la aplicación web** que aparece

## Paso 5: Actualizar la Configuración del Dashboard

1. Abre el archivo `data/config.js` en este proyecto
2. Reemplaza la URL actual de `gsUpdateUrl` con la nueva URL que copiaste
3. Guarda el archivo

## Paso 6: Probar

1. Refresca el dashboard en tu navegador
2. Ingresa con la contraseña "Tomi.2016"
3. Haz clic en "Editar tareas"
4. Modifica algún campo (Tareas, Owner, Deadline o Estatus)
5. Haz clic en "Guardar cambios"
6. Deberías ver el mensaje: "Cambios guardados correctamente"
7. Verifica en tu Google Sheet que los cambios se aplicaron

## Formato de Datos que Envía el Dashboard

El dashboard ahora envía este formato al Apps Script:

```javascript
{
  "changes": [
    {
      "id": "1",
      "changes": {
        "Tareas": "Nueva descripción de la tarea",
        "Owner": "Juan Pérez",
        "Deadline": "2025-11-15",
        "Estatus": "Iniciado"
      }
    }
  ]
}
```

**Importante:** El Apps Script actualizado puede manejar cualquier combinación de campos. Si solo cambias el Estatus, solo se enviará ese campo. Si cambias todos los campos, se enviarán todos.

## Solución de Problemas

### Error: "Hoja no encontrada"
- Verifica que el nombre en `CFG.SHEET_NAME` coincida exactamente con el nombre de tu pestaña en Google Sheets

### Error: "Columna ID no encontrada"
- Verifica que tu Google Sheet tenga una columna llamada "ID"
- Asegúrate de que los nombres de las columnas coincidan con los del archivo `data/config.js`

### Error: "Payload inválido"
- Asegúrate de haber implementado el nuevo código
- Verifica que la URL en `data/config.js` sea la correcta

### Los cambios no se guardan
- Verifica que hayas hecho clic en "Implementar" después de guardar el código
- Asegúrate de que la URL de implementación sea la más reciente
- Revisa los permisos de la aplicación web (debe ser "Cualquier persona")

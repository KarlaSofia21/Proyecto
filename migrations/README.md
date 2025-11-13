# Migración: Sistema de Bloqueo de Cuenta

## Descripción
Este script agrega la funcionalidad de bloqueo de cuenta después de 3 intentos fallidos de inicio de sesión.

## Campos Agregados
- `intentos_fallidos`: Contador de intentos fallidos (default: 0)
- `cuenta_bloqueada`: Indica si la cuenta está bloqueada (default: false)
- `fecha_bloqueo`: Timestamp del momento en que se bloqueó la cuenta

## Cómo Ejecutar

### Opción 1: Desde psql (PostgreSQL CLI)
```bash
psql -U tu_usuario -d tu_base_de_datos -f add_account_lockout.sql
```

### Opción 2: Desde pgAdmin o cualquier cliente SQL
1. Abre tu cliente SQL (pgAdmin, DBeaver, etc.)
2. Conéctate a tu base de datos
3. Ejecuta el contenido del archivo `add_account_lockout.sql`

### Opción 3: Desde Node.js (si tienes un script de migración)
```javascript
const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sql = fs.readFileSync('migrations/add_account_lockout.sql', 'utf8');
await pool.query(sql);
```

## Funcionalidad

### Comportamiento
- Después de **3 intentos fallidos**, la cuenta se bloquea automáticamente
- El bloqueo dura **15 minutos**
- Después de 15 minutos, la cuenta se desbloquea automáticamente
- Los intentos se resetean cuando el login es exitoso
- Los mensajes informan al usuario sobre:
  - Intentos restantes antes del bloqueo
  - Tiempo restante de bloqueo
  - Confirmación cuando la cuenta es bloqueada

### Aplicado a:
- Login con contraseña (`/api/login`)
- Login con PIN (`/api/pin-login`)

## Notas
- El tiempo de bloqueo es configurable en las constantes `TIEMPO_BLOQUEO_MINUTOS` en los archivos de rutas API
- El número máximo de intentos es configurable en la constante `MAX_INTENTOS` (actualmente 3)


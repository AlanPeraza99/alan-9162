Aplicación con registro e inicio de sesión local, dashboard de estadísticas simuladas y recargas de saldo mediante una api de pagos local, una pasarela de pagos ficticia.

## Tecnologías

- Frontend: React, TypeScript, Vite y Tailwind CSS.
- Backend: Express y TypeScript.
- Formularios y validaciones: Formik y Yup.
- Comunicación HTTP: Axios.
- Gráficas: Recharts.
- Notificaciones: Sonner.
- Pruebas: Vitest, Testing Library y Supertest.

## Requisitos

- Node.js en una versión compatible con los paquetes del proyecto y npm.
- Git para clonar el repositorio.
- Un navegador moderno con soporte para LocalStorage y diálogos nativos.

No se necesita una base de datos ni credenciales de una pasarela real.

## Instalación

Clona este repositorio y abre una terminal en su carpeta raíz. También puedes descargarlo como ZIP y extraerlo.

Instala las dependencias de la raíz, del frontend y del backend:

```bash
npm run install:all
```

## Variables de entorno

Crea `apps/api/.env` con:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
API_BASE_URL=http://localhost:3000
```

Crea `apps/web/.env` con:

```env
VITE_API_URL=http://localhost:3000/api
```

`API_BASE_URL` es el origen que utiliza la documentación OpenAPI. No incluye `/api`, porque las rutas documentadas ya contienen ese prefijo.

Si cambias el puerto del backend, actualiza también ambas URLs. Si cambias el origen del frontend, actualiza `FRONTEND_ORIGIN`. Reinicia los procesos después de modificar las variables.

## Ejecutar en desarrollo

Desde la raíz:

```bash
npm run dev
```

Este comando inicia ambos proyectos. Abre:

| Servicio           | Dirección                                   |
| ------------------ | ------------------------------------------- |
| Aplicación y login | http://localhost:5173/                      |
| Registro           | http://localhost:5173/registro              |
| Dashboard          | http://localhost:5173/dashboard             |
| Estado de la API   | http://localhost:5173/estatus               |
| Estado del backend | http://localhost:3000/api/                  |
| Swagger UI         | http://localhost:3000/api/docs/             |
| OpenAPI JSON       | http://localhost:3000/api/docs/openapi.json |

Para iniciar cada proyecto por separado:

```bash
npm run dev:api
npm run dev:web
```

Ejecuta esos dos comandos en terminales distintas. Para detener los procesos, utiliza `Ctrl+C`.

## Probar la aplicación

1. Abre `/registro` y crea una cuenta con nombre, correo, contraseña y confirmación.
2. Accede al dashboard. El saldo inicial es cero.
3. Cierra sesión y vuelve a ingresar con el mismo correo y contraseña.
4. Pulsa **Cargar saldo** para abrir el formulario de App de pagos.
5. Prueba los escenarios de la siguiente sección.
6. Recarga la página y comprueba que el saldo permanece guardado.
7. Cierra sesión y vuelve a entrar: la cuenta y el saldo deben conservarse.

El dashboard muestra cantidades simuladas de apuestas ganadas y perdidas y las victorias de seis caracoles en seis carreras. No implementa apuestas ni ejecución de carreras.

## Escenarios de App de pagos

App de pagos acepta únicamente las tarjetas ficticias listadas aquí. No introduzcas datos financieros reales.

Para todos los escenarios utiliza:

- Nombre completo: cualquier nombre no vacío.
- Vencimiento: `12/26`.
- CVV: `543`.
- Monto: una cantidad mayor que cero, con hasta dos decimales. Usa punto decimal, por ejemplo `100.50`.

El frontend añade automáticamente el identificador y correo del usuario de la sesión.

| Tarjeta ficticia   | HTTP | `status`   | `status_detail` | Resultado en saldo       |
| ------------------ | ---- | ---------- | --------------- | ------------------------ |
| `1234123412341234` | 200  | `approved` | `accredited`    | Suma el monto solicitado |
| `4000000000000002` | 200  | `rejected` | `card_declined` | No cambia                |
| `5000000000000000` | 503  | `error`    | `system_error`  | No cambia                |

Para simular datos de tarjeta incorrectos, utiliza la tarjeta aprobada y cambia el CVV a `111` o el vencimiento a `11/26`. La respuesta será HTTP `200`, con `status: rejected` y `status_detail: invalid_card_data`. El saldo no cambia.

Un HTTP `200` no significa por sí solo que el pago fue aprobado: el frontend comprueba `status === "approved"` antes de aumentar el saldo.

### Validaciones

Un monto cero o negativo, una tarjeta fuera de la lista y los campos obligatorios vacíos impiden enviar el formulario. El backend también valida las solicitudes y responde `422` ante datos inválidos.

### Fallo de conexión y timeout

Para comprobar el fallo de conexión, inicia ambos proyectos en terminales separadas, abre el formulario de recarga y detén el backend. Al enviar una recarga, debe mostrarse el aviso de conexión, habilitarse nuevamente el formulario y conservarse el saldo.

Axios tiene un timeout de 10 segundos. El aviso de timeout se muestra si el servidor no responde dentro de ese plazo. La tarjeta de fallo del sistema devuelve un `503`; no simula un timeout.

### Probar el endpoint directamente

El endpoint es `POST /api/App de pagos/payments`. Ejemplo de pago aprobado:

```bash
curl -i http://localhost:3000/api/App de pagos/payments \
  -H 'Content-Type: application/json' \
  -d '{
    "cardNumber": "1234123412341234",
    "expirationDate": "12/26",
    "cvv": "543",
    "fullName": "Usuario de prueba",
    "amount": 100,
    "payerId": "usuario-prueba",
    "payerEmail": "usuario@example.com"
  }'
```

Para reproducir los otros escenarios cambia `cardNumber` según la tabla. Una llamada directa al backend devuelve la operación, pero no modifica el LocalStorage del navegador; la actualización del saldo la realiza el frontend.

## Persistencia y alcance de la autenticación

LocalStorage conserva:

| Clave                   | Contenido                                                                |
| ----------------------- | ------------------------------------------------------------------------ |
| `caracoles.user`        | Usuario, saldo, hash y salt de la contraseña                             |
| `caracoles.session`     | Identificador del usuario con sesión activa                              |
| `caracoles.lastPayment` | Última respuesta de App de pagos, incluida la tarjeta y el CVV ficticios |

La contraseña original no se guarda; se utiliza un hash con scrypt y un salt aleatorio.

La autenticación es una simulación local de un solo usuario. Para verificar el login, el frontend envía las credenciales ingresadas y el correo, hash y salt guardados. No representa autenticación de producción ni utiliza sesiones gestionadas por el servidor.

Cerrar sesión elimina la clave de sesión y conserva la cuenta y el saldo. Registrar otra cuenta reemplaza al usuario local existente. La información no se comparte entre navegadores o dispositivos y puede modificarse desde las herramientas del navegador.

Para comenzar desde cero, elimina las tres claves anteriores desde las herramientas del navegador, en **Application → Local Storage**.

## Pruebas automatizadas

Desde la raíz, ejecuta todas las pruebas del frontend y backend:

```bash
npm test
```

Para ejecutar una suite por separado:

```bash
npm run test:api
npm run test:web
```

Los scripts de la raíz delegan en `test:run` de cada proyecto, que ejecuta `vitest run`. Las pruebas terminan después de ejecutarse; no quedan en modo observación.

Se cubren los endpoints de registro, login y App de pagos; las validaciones de los formularios; el manejo de errores; la navegación según la sesión; logout; persistencia; clics repetidos durante el envío; actualización del saldo y coherencia de las estadísticas.

Las pruebas del frontend simulan las respuestas HTTP. El flujo con backend real se comprueba siguiendo los pasos de este README. El foco, Escape y el bloqueo del fondo del modal nativo se revisan en un navegador, porque JSDOM no reproduce completamente esas funciones.

## Compilación

Desde la raíz:

```bash
npm run build
```

Para compilar por separado:

```bash
npm run build:api
npm run build:web
```

Los comandos conjuntos devuelven un resultado de error si cualquiera de los proyectos falla. La compilación genera los archivos de salida; no inicia los servidores ni despliega la aplicación.

## Organización

```text
apps/
  api/   Backend Express, validaciones, servicios, rutas y OpenAPI
  web/   Frontend React, componentes, hooks, contexto y gráficas
```

El backend separa controllers, services, schemas, interfaces y routes. El frontend separa vistas, componentes, hooks, contexto, constantes y validaciones.

## Documentación de la API

Swagger UI permite consultar los endpoints y enviar solicitudes de prueba. Desde su enlace de descarga puedes obtener el documento OpenAPI JSON e importarlo en Postman.

Para probar login desde Swagger o Postman, registra primero un usuario y utiliza el `email`, `passwordHash` y `passwordSalt` devueltos en `storedUser`, junto con el correo y la contraseña original del registro.

## Limitaciones

- App de pagos es un mock sin cobros reales.
- El saldo y la sesión son locales y no tienen autoridad financiera ni autenticación de producción.
- Las operaciones no se almacenan en una base de datos; solo se conserva la última respuesta local.
- Los datos de carreras y apuestas son fijos y simulados.

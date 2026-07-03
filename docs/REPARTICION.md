# Repartición de trabajo — Frontend E2E (Uber Clone)

Frontend React 19 + TypeScript + Vite + Tailwind v4 + axios + react-router-dom v7.
Backend en `http://localhost:8080` (ya está hecho, no se toca). Total: **20 puntos** repartidos en 7 pantallas.

El trabajo se divide en **3 personas**. La idea es que puedan avanzar **en paralelo** apoyándose en una **base común** que se define abajo, para no pisarse ni bloquearse.

---

## Reglas del juego (para que el trabajo sea continuo y no choque)

1. **Todos parten de la misma "base común"** (tipos, cliente axios, contexto de auth, router). La construye **Persona 1** y debe estar lista **primero**. Mientras tanto, Persona 2 y 3 pueden ir maquetando sus pantallas con datos falsos (mocks) usando los tipos ya acordados.
2. **Cada persona trabaja en su propia carpeta de páginas** → casi no hay conflictos de git.
3. **Contratos cerrados**: los tipos de `src/types.ts` y las funciones de `src/api/` NO se cambian sin avisar al grupo (todos dependen de ellas).
4. **Rama por persona** (`feature/nombre`), y se hace merge a `develop`/`main` cuando tu parte compila (`npm run build` sin errores).
5. **Convención de commits**: `feat(persona-1): login form`, etc.

---

## Estructura de carpetas acordada

```
src/
├── main.tsx
├── App.tsx                # Router principal (Persona 1)
├── index.css
├── types.ts              # Tipos compartidos (Persona 1) — NO tocar sin avisar
├── api/
│   ├── client.ts         # axios + interceptor token/401 (Persona 1)
│   ├── auth.ts           # login, register, me (Persona 1)
│   ├── trips.ts          # todos los endpoints de trips (Persona 1 crea, todos usan)
│   └── drivers.ts        # drivers/available (Persona 2)
├── auth/
│   ├── AuthContext.tsx   # user, token, login(), logout() (Persona 1)
│   └── ProtectedRoute.tsx# guard de rutas por rol (Persona 1)
├── components/           # componentes reutilizables (StatusBadge, etc.)
└── pages/
    ├── auth/             # Persona 1
    ├── passenger/        # Persona 2
    └── driver/           # Persona 3
```

---

## Base común (la hace Persona 1, la usan todos)

Estos son los **contratos** de los que depende todo el mundo. Persona 1 los entrega primero.

### `src/types.ts`
```typescript
export type Role = 'PASSENGER' | 'DRIVER';
export type TripStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  available: boolean;
  rating: number;
}

export interface Trip {
  id: number;
  status: TripStatus;
  pickupAddress: string;
  dropoffAddress: string;
  requestedAt: string;          // ISO 8601
  acceptedAt: string | null;
  completedAt: string | null;
  passenger: User;
  driver: User | null;
  passengerRating: number | null;
  ratingComment: string | null;
}
```

### `src/api/client.ts` (interceptor obligatorio)
- Base URL `http://localhost:8080`.
- Request interceptor: agrega `Authorization: Bearer <token>` desde `localStorage`.
- Response interceptor: si la respuesta es **401**, borra el token y redirige a `/login`.
- Los errores del backend vienen como `{ "error": "mensaje" }` (los de validación usan el nombre del campo como clave) → helper para extraer el mensaje.

### `src/api/trips.ts` (funciones que consumen Persona 2 y 3)
Persona 1 deja las firmas listas; el resto solo las importa:
```typescript
createTrip(pickupAddress, dropoffAddress): Promise<Trip>   // POST /trips
getMyTripsPassenger(): Promise<Trip[]>                     // GET /trips
getPendingTrips(): Promise<Trip[]>                         // GET /trips/pending
getMyTripsDriver(): Promise<Trip[]>                        // GET /trips/my
getTrip(id): Promise<Trip>                                 // GET /trips/{id}
acceptTrip(id): Promise<Trip>                              // PATCH /trips/{id}/accept
completeTrip(id): Promise<Trip>                            // PATCH /trips/{id}/complete
rateTrip(id, rating, comment?): Promise<Trip>              // POST /trips/{id}/rate
```

---

# 🟦 Persona 1 — Base común + Autenticación

**Puntos que cubre:** Pantalla 1 (3 pts) + toda la infraestructura de la que dependen los demás.

### Tareas
1. **Base común** (arriba): `types.ts`, `api/client.ts` con interceptor, `api/auth.ts`, `api/trips.ts` (firmas), `AuthContext`, `ProtectedRoute`, y el **router** en `App.tsx`.
2. **Pantalla 1 — Login / Registro** (`src/pages/auth/`)
   - Formulario con **email, contraseña y selector de rol** (`PASSENGER` / `DRIVER`) para el registro.
   - Login y Registro (pueden ser dos vistas o tabs).
   - Guardar el **JWT en `localStorage`** y adjuntarlo en cada request (vía interceptor).
   - Tras autenticar: llamar `GET /users/me` y **redirigir según rol** (`PASSENGER` → `/passenger`, `DRIVER` → `/driver`).
   - Manejar errores: `401` credenciales incorrectas, `404` email no existe.

### Endpoints
`POST /auth/register` · `POST /auth/login` · `GET /users/me`

### Rutas que define en el router
```
/login              → Login/Registro          (público)
/passenger          → Dashboard pasajero       (Persona 2, protegida rol PASSENGER)
/passenger/request  → Solicitar viaje          (Persona 2)
/passenger/trips/:id→ Detalle viaje pasajero    (Persona 2)
/driver             → Dashboard conductor       (Persona 3, protegida rol DRIVER)
/driver/trips/:id   → Detalle viaje conductor    (Persona 3)
/history            → Historial (ambos roles)    (Persona 3)
```

> Entregable clave: cuando Persona 1 termine la base, avisa al grupo. A partir de ahí Persona 2 y 3 conectan sus pantallas de verdad.

---

# 🟩 Persona 2 — Flujo del Pasajero

**Puntos que cubre:** Pantalla 2 (3) + Pantalla 3 (2) + Pantalla 4 (4) = **9 pts**.
Carpeta: `src/pages/passenger/`.

### Pantalla 2 — Dashboard pasajero (3 pts)
- Muestra el **nombre del usuario** (desde `GET /users/me`).
- Botón para **pedir viaje** (lleva a `/passenger/request`).
- **Lista de mis viajes** con **badge de estado** (`PENDING` / `IN_PROGRESS` / `COMPLETED`).
- Cada viaje enlaza a su detalle.
- Endpoints: `GET /users/me` · `GET /trips`

### Pantalla 3 — Solicitar viaje (2 pts)
- Antes de confirmar, **mostrar conductores disponibles** (`GET /drivers/available`, con nombre + rating). → Persona 2 crea `src/api/drivers.ts`.
- Formulario con **origen (`pickupAddress`) y destino (`dropoffAddress`)**.
- Llama `POST /trips` y **redirige al detalle** del viaje creado (`/passenger/trips/:id`).
- Endpoints: `GET /drivers/available` · `POST /trips`

### Pantalla 4 — Detalle de viaje (pasajero) (4 pts) ⭐ la más completa
- Muestra `pickupAddress`, `dropoffAddress`, **estado** y **conductor asignado** (nombre + rating), o **"buscando conductor..."** si `driver` es `null`.
- Si el viaje está **`COMPLETED` y `passengerRating` es `null`** → **formulario de calificación** (1–5 estrellas + comentario opcional) que llama `POST /trips/{id}/rate`.
- **Polling cada 3–5 s** con `setInterval` llamando `GET /trips/{id}` mientras el estado sea `PENDING` o `IN_PROGRESS` (detener el intervalo al desmontar o al llegar a `COMPLETED`).
- Ojo con nullables: usar `?.` en `driver`, `acceptedAt`, etc.
- Endpoints: `GET /trips/{id}` · `POST /trips/{id}/rate`

---

# 🟥 Persona 3 — Flujo del Conductor + Historial

**Puntos que cubre:** Pantalla 5 (4) + Pantalla 6 (2) + Pantalla 7 (2) = **8 pts**.
Carpeta: `src/pages/driver/` (+ historial compartido).

### Pantalla 5 — Dashboard conductor (4 pts) ⭐
- Muestra **su propio rating** (desde `GET /users/me`).
- **Lista de viajes `PENDING`** (`GET /trips/pending`) cada uno con botón **"Aceptar"** → `PATCH /trips/{id}/accept`.
- **Resalta arriba el viaje activo `IN_PROGRESS`** (de `GET /trips/my`) con botón **"Completar viaje"** o enlace a su detalle.
- Manejar errores del accept: `400 "Trip is not available for acceptance"`, `400 "Driver is not available"`.
- Endpoints: `GET /users/me` · `GET /trips/pending` · `GET /trips/my` · `PATCH /trips/{id}/accept`

### Pantalla 6 — Detalle de viaje (conductor) (2 pts)
- Muestra `pickupAddress`, `dropoffAddress` y **datos del pasajero**.
- Botón **"Completar viaje"** si el estado es `IN_PROGRESS` → `PATCH /trips/{id}/complete`.
- Muestra **resumen** tras completar (estado `COMPLETED`, `completedAt`).
- Endpoints: `GET /trips/{id}` · `PATCH /trips/{id}/complete`

### Pantalla 7 — Historial (2 pts, sirve a ambos roles)
- **Tabla de viajes pasados** con **filtro por estado** (`PENDING` / `IN_PROGRESS` / `COMPLETED`).
- Según el rol del usuario logueado usa: `GET /trips` (PASSENGER) o `GET /trips/my` (DRIVER).
- Componente reutilizable de `StatusBadge` (coordinar con Persona 2 para no duplicarlo → ponerlo en `src/components/`).
- Endpoints: `GET /trips` (PASSENGER) · `GET /trips/my` (DRIVER)

---

## Orden sugerido de trabajo (para que sea continuo)

1. **Persona 1** monta la base común + login. (Persona 2 y 3 maquetan con mocks mientras tanto.)
2. En cuanto la base esté lista → **Persona 2 y 3 conectan sus pantallas** a las funciones reales de `src/api/`.
3. Merge frecuente a `develop`. Al final se prueba el **flujo completo** end-to-end con los usuarios seed del backend.

## Usuarios de prueba (seed del backend)
| Email | Password | Rol |
|-------|----------|-----|
| `carlos@uber.com` | `pass123` | DRIVER (disponible, rating 4.8) |
| `lucia@uber.com` | `pass123` | DRIVER (ocupado) |
| `ana@uber.com` | `pass123` | PASSENGER |
| `mario@uber.com` | `pass123` | PASSENGER |

Levantar backend: `./mvnw spring-boot:run` (puerto 8080). Swagger: `http://localhost:8080/swagger-ui.html`.

## Checklist final (para los 20 pts)
- [ ] Todos los endpoints del backend se consumen al menos una vez.
- [ ] Token se guarda en `localStorage` y se envía en cada request.
- [ ] Interceptor redirige a `/login` en `401`.
- [ ] Redirección por rol tras login.
- [ ] Badges de estado en las listas.
- [ ] Polling cada 3–5 s en el detalle del pasajero.
- [ ] Formulario de calificación (1–5 estrellas) funcionando.
- [ ] Manejo de campos `null` con `?.`.
- [ ] `npm run build` sin errores de TypeScript.

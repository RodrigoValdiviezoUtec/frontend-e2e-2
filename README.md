# Frontend E2E — Aplicación de Viajes

Frontend de una aplicación de solicitud y gestión de viajes (estilo ride-hailing),
construida con **React 19**, **TypeScript** y **Vite**. La interfaz maneja dos roles
—**pasajero** y **conductor**— con autenticación por JWT y comunicación con un
backend en Spring Boot.

## Integrantes

| Apellidos y Nombres | Código |
| --- | --- |
| Huertos Ochoa, Rodrigo Franco | 202510118 |
| Valdiviezo Ortiz, José Rodrigo | 202510135 |
| Ferrante Quino, Francesco Aroldo | 202510174 |

## Descripción

La aplicación permite:

- **Autenticación** de usuarios mediante login y token JWT, con rutas protegidas
  según el rol.
- **Flujo del pasajero:** solicitar un viaje (dirección de recojo y destino),
  ver el detalle y estado del viaje en curso, y calificar al conductor.
- **Flujo del conductor:** ver los viajes disponibles, aceptar solicitudes y
  gestionar el estado del viaje (pendiente → en progreso → completado).
- **Historial** de viajes disponible para ambos roles.

## Tecnologías

- **React 19** + **TypeScript**
- **Vite** como bundler y servidor de desarrollo
- **React Router DOM 7** para el ruteo y las rutas protegidas
- **Tailwind CSS 4** para los estilos
- **Axios** para el consumo de la API (con interceptores para el JWT)

## Estructura del proyecto

```
src/
├── api/            # Cliente Axios y llamadas al backend (auth, trips, drivers)
├── auth/           # Contexto de autenticación y rutas protegidas
├── components/     # Componentes reutilizables (StatusBadge, Placeholder)
├── pages/
│   ├── auth/       # Login
│   ├── passenger/  # Dashboard, solicitud y detalle de viaje del pasajero
│   ├── driver/     # Dashboard y detalle de viaje del conductor
│   └── HistoryPage # Historial de viajes (ambos roles)
├── types.ts        # Tipos de dominio (User, Trip, Role, TripStatus)
├── App.tsx         # Definición de rutas
└── main.tsx        # Punto de entrada
```

## Requisitos previos

- **Node.js** 18 o superior
- El backend (Spring Boot) corriendo en `http://localhost:8080`
  (configurable en `src/api/client.ts`).

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Levantar el servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar el build de producción
npm run preview

# Ejecutar el linter
npm run lint
```

El servidor de desarrollo se levanta por defecto en `http://localhost:5173`.

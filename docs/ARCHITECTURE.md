# Arquitectura del Sistema PGD

El siguiente diagrama ilustra la arquitectura de alto nivel del sistema, separando claramente el Frontend (Cliente) del Backend (Servidor) y la Base de Datos.

```mermaid
graph TD
    subgraph Client [Frontend (React + Vite)]
        A[Navegador del Usuario] -->|HTTP/HTTPS| B[React Router]
        B --> C[Páginas (Dashboard, Login, etc.)]
        C -->|Axios Calls| D[AuthContext]
        D -->|API Requests| E[API Gateway (Vite Proxy)]
    end

    subgraph Server [Backend (Node.js + Express)]
        E -->|JSON Payload| F[Express Server]
        F --> G[Middleware (CORS, RateLimit, Auth)]
        G --> H[Rutas (API Routes)]
        H --> I[Controladores]
        I --> J[Capa de Datos (MySQL Pool)]
    end

    subgraph Database [Persistencia]
        J -->|SQL Queries| K[(MySQL Database)]
        K -->|Tables| L{Relaciones}
        L --> M[Users]
        L --> N[Reservas]
        L --> O[Horarios]
        L --> P[Personal]
    end

    style Client fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style Server fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    style Database fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
```

## Descripción de Componentes

1.  **Frontend**: Single Page Application (SPA) construida con React. Utiliza Tailwind CSS para estilos y Context API para manejo de estado global.
2.  **Backend**: API RESTful construida con Express. Implementa arquitectura MVC (Modelo-Vista-Controlador).
3.  **Base de Datos**: Base de datos relacional MySQL.

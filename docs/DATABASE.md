# Modelo Entidad-Relación (MER)

Este diagrama representa la estructura de la base de datos del sistema PGD.

```mermaid
erDiagram
    USERS {
        int id PK
        string email
        string password "Hashed"
        string role "admin"
        string reset_token
        datetime reset_token_expires
    }

    RESERVAS {
        int id PK
        string escenario
        date fecha
        string hora_inicio
        string hora_fin
        string estado
        string nombre_solicitante
        string telefono_solicitante
        text descripcion_actividad
    }

    PERSONAL_HORARIOS {
        int id PK
        string escenario
        string gestor_nombre
        string contacto
        string lunes
        string martes
        string miercoles
        string jueves
        string viernes
        string sabado
        string domingo
        timestamp updated_at
    }

    %% Relaciones implícitas (lógica de negocio)
    USERS ||--o{ RESERVAS : "gestiona (admin)"
```

## Diccionario de Datos Simplificado

| Tabla | Descripción |
| :--- | :--- |
| **users** | Almacena credenciales de acceso para administradores y empleados. |
| **reservas** | Registro centralizado de solicitudes de espacios deportivos. |
| **personal_horarios** | Malla de turnos y contacto de los gestores de cada escenario. |

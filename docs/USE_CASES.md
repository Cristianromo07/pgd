# Diagrama de Casos de Uso

Representación de las funcionalidades principales disponibles para cada actor del sistema.

```mermaid
usecaseDiagram
    actor Admin as Administrador
    actor Empleado as Empleado/Gestor
    actor User as Usuario General

    package Sistema_PGD {
        usecase "Iniciar Sesión" as UC1
        usecase "Recuperar Contraseña" as UC2
        usecase "Gestionar Usuarios (CRUD)" as UC3
        usecase "Gestionar Escenarios" as UC4
        usecase "Crear Reserva" as UC5
        usecase "Ver Horarios de Personal" as UC6
        usecase "Consultar Disponibilidad" as UC7
    }

    User <|-- Empleado
    Empleado <|-- Admin

    User --> UC1
    User --> UC2
    User --> UC7

    Empleado --> UC5
    Empleado --> UC6

    Admin --> UC3
    Admin --> UC4
```

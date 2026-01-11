export interface Gestor {
    id?: number;
    nombre: string;
    contacto?: string;
    turnos: string[];
}

export interface Escenario {
    id: number;
    nombre: string;
}

export interface EscenarioData {
    escenario: string;
    id?: number;
    gestores: Gestor[];
    gaps: { day: number; shift: string }[];
}

export interface ActiveGap {
    escenario: string;
    day: number;
    shift: string;
}

export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const TURNO_PRESETS = [
    "6:00 1:30",
    "2:30 10:00",
    "DESCANSO",
    "INCAPACITADA",
    "VACACIONES",
    "CICLOVIA",
    "D. PROGRAMADO"
];

export const ALLOWED_ESCENARIOS = [
    'POLIDEPORTIVO SUR',
    'CANCHAS COMFAMA',
    'UNIDAD DEPOR. EL DORADO',
    'CANCHAS HOSPITAL',
    'ALCALÁ',
    'POLI. LAS COMETAS',
    'LOMA DEL BARRO',
    'BOULEVARD',
    'CICLOVÍA'
];

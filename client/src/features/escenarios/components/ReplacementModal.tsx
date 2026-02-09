import React from 'react';
import { X, Search, Plus } from 'lucide-react';
import { Gestor, EscenarioData, ActiveGap, DAYS } from '../../../types/horario';

interface ReplacementModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeGap: ActiveGap | null;
    data: EscenarioData[];
    onAssign: (gestor: Gestor) => void;
}

/**
 * Modal profesional para buscar y asignar gestores de reemplazo.
 * Filtra automáticamente gestores disponibles basándose en turnos y descansos.
 */
const ReplacementModal: React.FC<ReplacementModalProps> = ({
    isOpen,
    onClose,
    activeGap,
    data,
    onAssign
}) => {
    if (!isOpen || !activeGap) return null;

    // Lógica optimizada para encontrar gestores disponibles
    const getAvailableGestores = () => {
        const allUniqueGestores: Gestor[] = [];
        const seenNames = new Set<string>();

        data.forEach(esc => {
            esc.gestores.forEach(g => {
                if (!seenNames.has(g.nombre)) {
                    seenNames.add(g.nombre);
                    allUniqueGestores.push(g);
                }
            });
        });

        const targetShiftKey = activeGap.shift === 'MAÑANA' ? '6 AM' : '12 PM';

        return allUniqueGestores.filter(g => {
            let isBlockingStatus = false;
            let hasDifferentShiftOnSameDay = false;

            data.forEach(esc => {
                const match = esc.gestores.find(eg => eg.nombre === g.nombre);
                if (match) {
                    const currentDayTurno = (match.turnos[activeGap.day] || '').toUpperCase();

                    if (currentDayTurno !== "") {
                        // Estados que impiden el reemplazo
                        if (currentDayTurno.includes('DESCANSO') ||
                            currentDayTurno.includes('VACACIONES') ||
                            currentDayTurno.includes('INCAPACIDAD')) {
                            isBlockingStatus = true;
                        }
                        // Impedir si ya tiene un turno diferente ese mismo día
                        else if (!currentDayTurno.includes(targetShiftKey)) {
                            hasDifferentShiftOnSameDay = true;
                        }
                    }
                }
            });

            return !isBlockingStatus && !hasDifferentShiftOnSameDay;
        });
    };

    const available = getAvailableGestores();

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
                    <div>
                        <h2 className="font-bold uppercase text-[10px] flex items-center gap-2">
                            <Search size={14} /> Buscar Reemplazo
                        </h2>
                        <p className="text-[8px] font-medium uppercase opacity-50 mt-0.5">
                            {activeGap.escenario} • {DAYS[activeGap.day]} ({activeGap.shift})
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-all">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-4 max-h-[40vh] overflow-auto bg-slate-50 space-y-2">
                    {available.length === 0 ? (
                        <div className="text-center py-6 bg-white border border-dashed border-slate-200 rounded-xl">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Sin disponibilidad</p>
                        </div>
                    ) : (
                        available.map(g => (
                            <button
                                key={g.nombre}
                                onClick={() => onAssign(g)}
                                className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-all group"
                            >
                                <div className="text-left">
                                    <p className="font-bold text-[11px] text-slate-900 uppercase leading-none">{g.nombre}</p>
                                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{g.contacto || 'N/A'}</p>
                                </div>
                                <Plus size={14} className="text-slate-200 group-hover:text-blue-500" />
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReplacementModal;

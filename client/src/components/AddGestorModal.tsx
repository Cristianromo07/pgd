import React from 'react';
import { X, UserPlus } from 'lucide-react';
import { ALLOWED_ESCENARIOS } from '../types/horario';

interface AddGestorModalProps {
    isOpen: boolean;
    onClose: () => void;
    newGestor: { nombre: string; contacto: string; escenario: string };
    setNewGestor: (data: any) => void;
    onAdd: () => void;
    allowedEscenarios: string[];
}

/**
 * Modal profesional para el registro de nuevos gestores en el sistema.
 * Permite asignar un nombre, contacto y sede inicial.
 */
const AddGestorModal: React.FC<AddGestorModalProps> = ({
    isOpen,
    onClose,
    newGestor,
    setNewGestor,
    onAdd,
    allowedEscenarios
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
                    <h2 className="font-bold uppercase text-[10px] flex items-center gap-2">
                        <UserPlus size={14} /> Registrar Gestor
                    </h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-all">
                        <X size={16} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                        <input
                            type="text"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-xs outline-none focus:border-blue-500 transition-all"
                            value={newGestor.nombre}
                            onChange={e => setNewGestor({ ...newGestor, nombre: e.target.value.toUpperCase() })}
                            placeholder="EJ: JUAN PÉREZ"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contacto / Tel</label>
                            <input
                                type="text"
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-xs outline-none focus:border-blue-500 transition-all"
                                value={newGestor.contacto}
                                onChange={e => setNewGestor({ ...newGestor, contacto: e.target.value })}
                                placeholder="300..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sede Asignada</label>
                            <select
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-[11px] outline-none focus:border-blue-500 cursor-pointer"
                                value={newGestor.escenario}
                                onChange={e => setNewGestor({ ...newGestor, escenario: e.target.value })}
                            >
                                <option value="">SELECCIONE...</option>
                                {allowedEscenarios.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={onAdd}
                        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold uppercase text-[10px] hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                        Confirmar Registro
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddGestorModal;

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Save } from 'lucide-react';
import api from '../../../api';

interface Scenario {
    id: number;
    nombre: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

export default function ManageEscenariosModal({ isOpen, onClose, onUpdated }: Props) {
    const [escenarios, setEscenarios] = useState<Scenario[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newScenarioName, setNewScenarioName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    const loadEscenarios = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/escenarios');
            setEscenarios(response.data);
        } catch (error) {
            console.error('Error loading scenarios:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadEscenarios();
        }
    }, [isOpen]);

    const handleAdd = async () => {
        if (!newScenarioName.trim()) return;
        try {
            await api.post('/escenarios', { nombre: newScenarioName.toUpperCase() });
            setNewScenarioName('');
            loadEscenarios();
            onUpdated();
        } catch (error) {
            alert('Error al agregar escenario');
        }
    };

    const handleUpdate = async (id: number) => {
        if (!editingName.trim()) return;
        try {
            await api.put(`/escenarios/${id}`, { nombre: editingName.toUpperCase() });
            setEditingId(null);
            loadEscenarios();
            onUpdated();
        } catch (error) {
            alert('Error al actualizar escenario');
        }
    };

    const handleDelete = async (id: number, nombre: string) => {
        if (!window.confirm(`¿Seguro que quieres eliminar "${nombre}"?`)) return;
        try {
            await api.delete(`/escenarios/${id}`);
            loadEscenarios();
            onUpdated();
        } catch (error) {
            alert('Error al eliminar escenario. Puede que tenga datos asociados.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Gestionar Escenarios</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Agregar Nuevo */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="NUEVO ESCENARIO..."
                            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase outline-none focus:border-blue-500"
                            value={newScenarioName}
                            onChange={(e) => setNewScenarioName(e.target.value)}
                        />
                        <button
                            onClick={handleAdd}
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Lista */}
                    <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 no-scrollbar">
                        {isLoading ? (
                            <p className="text-center text-[10px] font-bold text-slate-400 uppercase py-4">Cargando...</p>
                        ) : escenarios.length === 0 ? (
                            <p className="text-center text-[10px] font-bold text-slate-400 uppercase py-4">No hay escenarios</p>
                        ) : (
                            escenarios.map((esc) => (
                                <div key={esc.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 group">
                                    {editingId === esc.id ? (
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 p-1 bg-white border border-blue-300 rounded text-xs font-bold uppercase outline-none"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                autoFocus
                                            />
                                            <button onClick={() => handleUpdate(esc.id)} className="text-emerald-600 hover:text-emerald-700">
                                                <Save size={16} />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-rose-600 hover:text-rose-700">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-[11px] font-bold text-slate-700 uppercase">{esc.nombre}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(esc.id);
                                                        setEditingName(esc.nombre);
                                                    }}
                                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-all"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(esc.id, esc.nombre)}
                                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-[10px] font-bold text-slate-500 uppercase hover:text-slate-800 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

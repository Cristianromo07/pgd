import React, { useState, useEffect } from 'react';

const COLORS = ['rojo', 'azul', 'amarillo', 'naranja', 'violeta'];
const DIAS_SEMANA = [
    { id: 1, label: 'L', full: 'Lunes' },
    { id: 2, label: 'M', full: 'Martes' },
    { id: 3, label: 'X', full: 'Miércoles' },
    { id: 4, label: 'J', full: 'Jueves' },
    { id: 5, label: 'V', full: 'Viernes' },
    { id: 6, label: 'S', full: 'Sábado' },
    { id: 0, label: 'D', full: 'Domingo' }
];

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: any) => void;
    onDelete: (id: number) => void;
    initialData: any;
    scenarios: any[];
}

export default function BookingModal({ isOpen, onClose, onSave, onDelete, initialData, scenarios }: BookingModalProps) {
    const [formData, setFormData] = useState<any>({
        escenario_id: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        color: 'azul',
        nombre_solicitante: '',
        telefono_solicitante: '',
        descripcion_actividad: '',
        repite: 'nunca',
        intervalo: 1,
        dias_semana: [],
        fin_tipo: 'repeticiones',
        fin_fecha: '',
        fin_repeticiones: 12
    });

    const [showCustomRecurrence, setShowCustomRecurrence] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id,
                escenario_id: initialData.escenario_id || (scenarios[0]?.id || ''),
                fecha: initialData.fecha || '',
                hora_inicio: initialData.hora_inicio || '',
                hora_fin: initialData.hora_fin || '',
                color: initialData.color || 'azul',
                nombre_solicitante: initialData.nombre_solicitante || '',
                telefono_solicitante: initialData.telefono_solicitante || '',
                descripcion_actividad: initialData.descripcion_actividad || '',
                repite: 'nunca',
                intervalo: 1,
                dias_semana: [],
                fin_tipo: 'repeticiones',
                fin_fecha: '',
                fin_repeticiones: 12
            });
        }
    }, [initialData, scenarios]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const toggleDiaSemana = (dia: number) => {
        setFormData((prev: any) => {
            const dias = prev.dias_semana.includes(dia)
                ? prev.dias_semana.filter((d: number) => d !== dia)
                : [...prev.dias_semana, dia];
            return { ...prev, dias_semana: dias };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 text-slate-800">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                    <h2 className="text-sm font-bold uppercase tracking-tight">
                        {formData.id ? 'Editar Reserva' : 'Nueva Reserva'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Escenario</label>
                        <select
                            name="escenario_id"
                            value={formData.escenario_id}
                            onChange={handleChange}
                            className="w-full rounded-lg border-slate-200 border p-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        >
                            {scenarios.map(sc => (
                                <option key={sc.id} value={sc.id}>{sc.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Solicitante</label>
                            <input
                                type="text"
                                name="nombre_solicitante"
                                value={formData.nombre_solicitante}
                                onChange={handleChange}
                                placeholder="Nombre completo"
                                className="w-full rounded-lg border-slate-200 border p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Teléfono</label>
                            <input
                                type="tel"
                                name="telefono_solicitante"
                                value={formData.telefono_solicitante}
                                onChange={handleChange}
                                placeholder="3xx..."
                                className="w-full rounded-lg border-slate-200 border p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Descripción</label>
                        <textarea
                            name="descripcion_actividad"
                            value={formData.descripcion_actividad}
                            onChange={handleChange}
                            placeholder="Tipo de actividad..."
                            rows={2}
                            className="w-full rounded-lg border-slate-200 border p-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Fecha</label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-200 border p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Inicio</label>
                            <input
                                type="time"
                                name="hora_inicio"
                                value={formData.hora_inicio}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-200 border p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 tracking-widest">Fin</label>
                            <input
                                type="time"
                                name="hora_fin"
                                value={formData.hora_fin}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-200 border p-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {!formData.id && (
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Repetición</label>
                            <select
                                name="repite"
                                value={formData.repite}
                                onChange={(e) => {
                                    handleChange(e);
                                    if (e.target.value === 'custom') setShowCustomRecurrence(true);
                                    else setShowCustomRecurrence(false);
                                }}
                                className="w-full rounded-lg border-slate-200 border p-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="nunca">No se repite</option>
                                <option value="diario">Cada día</option>
                                <option value="semanal">Cada semana</option>
                                <option value="mensual">Cada mes</option>
                                <option value="custom">Personalizado...</option>
                            </select>

                            {(formData.repite !== 'nunca' || showCustomRecurrence) && (
                                <div className="mt-4 space-y-4 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2 text-xs font-bold">
                                        <span>Cada</span>
                                        <input
                                            type="number"
                                            name="intervalo"
                                            min="1"
                                            value={formData.intervalo}
                                            onChange={handleChange}
                                            className="w-12 rounded border-slate-200 p-1 text-center font-bold"
                                        />
                                        <span>{formData.repite === 'diario' ? 'días' : formData.repite === 'mensual' ? 'meses' : 'semanas'}</span>
                                    </div>

                                    {(formData.repite === 'semanal' || formData.repite === 'custom') && (
                                        <div>
                                            <div className="flex justify-between gap-1">
                                                {DIAS_SEMANA.map(dia => (
                                                    <button
                                                        key={dia.id}
                                                        type="button"
                                                        onClick={() => toggleDiaSemana(dia.id)}
                                                        className={`w-7 h-7 rounded-lg text-[10px] font-bold border transition-all ${formData.dias_semana.includes(dia.id)
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                                            }`}
                                                        title={dia.full}
                                                    >
                                                        {dia.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-slate-200">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] font-bold cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="fin_tipo"
                                                    value="repeticiones"
                                                    checked={formData.fin_tipo === 'repeticiones'}
                                                    onChange={handleChange}
                                                    className="w-3 h-3 text-blue-600"
                                                />
                                                <span>Finaliza tras</span>
                                                <input
                                                    type="number"
                                                    name="fin_repeticiones"
                                                    min="1"
                                                    value={formData.fin_repeticiones}
                                                    onChange={handleChange}
                                                    disabled={formData.fin_tipo !== 'repeticiones'}
                                                    className="w-12 rounded border-slate-200 p-0.5 text-center disabled:opacity-50 text-[10px]"
                                                />
                                                <span>veces</span>
                                            </label>

                                            <label className="flex items-center gap-2 text-[10px] font-bold cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="fin_tipo"
                                                    value="fecha"
                                                    checked={formData.fin_tipo === 'fecha'}
                                                    onChange={handleChange}
                                                    className="w-3 h-3 text-blue-600"
                                                />
                                                <span>Finaliza el día</span>
                                                <input
                                                    type="date"
                                                    name="fin_fecha"
                                                    value={formData.fin_fecha}
                                                    onChange={handleChange}
                                                    disabled={formData.fin_tipo !== 'fecha'}
                                                    className="rounded border-slate-200 p-0.5 outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 text-[10px]"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-widest">Iconografía</label>
                        <div className="flex gap-3">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${formData.color === c ? 'border-slate-800 ring-2 ring-slate-200' : 'border-transparent'
                                        }`}
                                    style={{ backgroundColor: getColorHex(c) }}
                                    onClick={() => setFormData({ ...formData, color: c })}
                                    aria-label={c}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white">
                        {formData.id && (
                            <button
                                type="button"
                                onClick={() => onDelete(formData.id)}
                                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold text-[10px] uppercase transition-colors mr-auto border border-rose-100"
                            >
                                Eliminar
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 font-bold text-[10px] uppercase transition-colors border border-slate-200"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-[10px] uppercase shadow-sm transition-all active:scale-95"
                        >
                            {formData.id ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function getColorHex(colorName: string) {
    const map: any = {
        rojo: '#ef4444',
        azul: '#3b82f6',
        amarillo: '#eab308',
        naranja: '#f97316',
        violeta: '#a855f7'
    };
    return map[colorName] || '#3b82f6';
}

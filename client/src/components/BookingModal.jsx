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

export default function BookingModal({ isOpen, onClose, onSave, onDelete, initialData, scenarios }) {
    const [formData, setFormData] = useState({
        escenario_id: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        color: 'azul',
        // Recurrencia
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleDiaSemana = (dia) => {
        setFormData(prev => {
            const dias = prev.dias_semana.includes(dia)
                ? prev.dias_semana.filter(d => d !== dia)
                : [...prev.dias_semana, dia];
            return { ...prev, dias_semana: dias };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {formData.id ? 'Editar Reserva' : 'Nueva Reserva'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Escenario</label>
                        <select
                            name="escenario_id"
                            value={formData.escenario_id}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        >
                            {scenarios.map(sc => (
                                <option key={sc.id} value={sc.id}>{sc.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fecha</label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Inicio</label>
                            <input
                                type="time"
                                name="hora_inicio"
                                value={formData.hora_inicio}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Fin</label>
                            <input
                                type="time"
                                name="hora_fin"
                                value={formData.hora_fin}
                                onChange={handleChange}
                                className="w-full rounded-lg border-gray-300 border p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Sección de Recurrencia */}
                    {!formData.id && (
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                            <div className="flex items-center gap-2 mb-3">
                                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                <span className="text-sm font-bold text-slate-700">Repetir</span>
                            </div>

                            <select
                                name="repite"
                                value={formData.repite}
                                onChange={(e) => {
                                    handleChange(e);
                                    if (e.target.value === 'custom') setShowCustomRecurrence(true);
                                    else setShowCustomRecurrence(false);
                                }}
                                className="w-full rounded-lg border-gray-300 border p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="nunca">No se repite</option>
                                <option value="diario">Cada día</option>
                                <option value="semanal">Cada semana</option>
                                <option value="mensual">Cada mes</option>
                                <option value="custom">Personalizado...</option>
                            </select>

                            {(formData.repite !== 'nunca' || showCustomRecurrence) && (
                                <div className="mt-4 space-y-4 animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span>Repetir cada</span>
                                        <input
                                            type="number"
                                            name="intervalo"
                                            min="1"
                                            value={formData.intervalo}
                                            onChange={handleChange}
                                            className="w-16 rounded border-gray-300 p-1 text-center"
                                        />
                                        <span>{formData.repite === 'diario' ? 'días' : formData.repite === 'mensual' ? 'meses' : 'semanas'}</span>
                                    </div>

                                    {(formData.repite === 'semanal' || formData.repite === 'custom') && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Repetir el</p>
                                            <div className="flex justify-between">
                                                {DIAS_SEMANA.map(dia => (
                                                    <button
                                                        key={dia.id}
                                                        type="button"
                                                        onClick={() => toggleDiaSemana(dia.id)}
                                                        className={`w-9 h-9 rounded-full text-xs font-bold border transition-all ${formData.dias_semana.includes(dia.id)
                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-110'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400'
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
                                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Termina</p>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-3 text-sm cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="fin_tipo"
                                                    value="repeticiones"
                                                    checked={formData.fin_tipo === 'repeticiones'}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span>Después de</span>
                                                <input
                                                    type="number"
                                                    name="fin_repeticiones"
                                                    min="1"
                                                    value={formData.fin_repeticiones}
                                                    onChange={handleChange}
                                                    disabled={formData.fin_tipo !== 'repeticiones'}
                                                    className="w-16 rounded border-gray-300 p-1 text-center disabled:opacity-50"
                                                />
                                                <span>veces</span>
                                            </label>

                                            <label className="flex items-center gap-3 text-sm cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="fin_tipo"
                                                    value="fecha"
                                                    checked={formData.fin_tipo === 'fecha'}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span>El día</span>
                                                <input
                                                    type="date"
                                                    name="fin_fecha"
                                                    value={formData.fin_fecha}
                                                    onChange={handleChange}
                                                    disabled={formData.fin_tipo !== 'fecha'}
                                                    className="rounded border-gray-300 p-1 outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Color / Categoría</label>
                        <div className="flex gap-3">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${formData.color === c ? 'border-slate-800 ring-2 ring-slate-400' : 'border-transparent'
                                        }`}
                                    style={{ backgroundColor: getColorHex(c) }}
                                    onClick={() => setFormData({ ...formData, color: c })}
                                    aria-label={c}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
                        {formData.id && (
                            <button
                                type="button"
                                onClick={() => onDelete(formData.id)}
                                className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold transition-colors mr-auto"
                            >
                                Eliminar
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-bold transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                        >
                            {formData.id ? 'Actualizar' : 'Crear Reserva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function getColorHex(colorName) {
    const map = {
        rojo: '#ef4444',
        azul: '#3b82f6',
        amarillo: '#eab308',
        naranja: '#f97316',
        violeta: '#a855f7'
    };
    return map[colorName] || '#3b82f6';
}

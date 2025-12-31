import React, { useState, useEffect } from 'react';
import api from '../api';

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

export default function ReservaForm({ escenarios, onSuccess, initialDate }) {
    const [formData, setFormData] = useState({
        escenario_id: '',
        fecha: initialDate || '',
        hora_inicio: '',
        hora_fin: '',
        color: 'azul',
        repite: 'nunca',
        intervalo: 1,
        dias_semana: [],
        fin_tipo: 'repeticiones',
        fin_fecha: '',
        fin_repeticiones: 12
    });

    const [loading, setLoading] = useState(false);
    const [showCustom, setShowCustom] = useState(false);

    useEffect(() => {
        if (escenarios.length > 0 && !formData.escenario_id) {
            setFormData(prev => ({ ...prev, escenario_id: escenarios[0].id }));
        }
    }, [escenarios]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/reservas', formData);
            alert(res.data.message || 'Reserva(s) creada(s) con éxito! 🎉');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Error al procesar la reserva');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 space-y-6">
            <div className="flex items-center gap-3 border-b pb-4">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Nueva Reserva</h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Configuración de Horarios y Repetición</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Escenario Deportivo</label>
                        <select
                            name="escenario_id"
                            value={formData.escenario_id}
                            onChange={handleChange}
                            className="w-full rounded-lg border-slate-200 border p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            required
                        >
                            {escenarios.map(esc => (
                                <option key={esc.id} value={esc.id}>{esc.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                            <input
                                type="date"
                                name="fecha"
                                value={formData.fecha}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-200 border p-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">H. Inicio</label>
                            <input
                                type="time"
                                name="hora_inicio"
                                value={formData.hora_inicio}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-200 border p-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">H. Fin</label>
                            <input
                                type="time"
                                name="hora_fin"
                                value={formData.hora_fin}
                                onChange={handleChange}
                                className="w-full rounded-lg border-slate-200 border p-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Categoría (Color)</label>
                        <div className="flex gap-4">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, color: c }))}
                                    className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 shadow-sm ${formData.color === c ? 'border-slate-800 ring-2 ring-slate-200' : 'border-white'
                                        }`}
                                    style={{ backgroundColor: getColorHex(c) }}
                                    title={c}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="text-sm font-bold text-slate-700">Repetición Sugerida</span>
                    </div>

                    <select
                        name="repite"
                        value={formData.repite}
                        onChange={(e) => {
                            handleChange(e);
                            setShowCustom(e.target.value === 'custom');
                        }}
                        className="w-full rounded-lg border-slate-200 border p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    >
                        <option value="nunca">No se repite</option>
                        <option value="diario">Diaria</option>
                        <option value="semanal">Semanal</option>
                        <option value="mensual">Mensual</option>
                        <option value="custom">Personalizado / Google Style</option>
                    </select>

                    {(formData.repite !== 'nunca' || showCustom) && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                            <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                <span>Cada</span>
                                <input
                                    type="number"
                                    name="intervalo"
                                    min="1"
                                    value={formData.intervalo}
                                    onChange={handleChange}
                                    className="w-16 rounded-md border-slate-300 p-1.5 text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <span>{formData.repite === 'diario' ? 'días' : formData.repite === 'mensual' ? 'meses' : 'semanas'}</span>
                            </div>

                            {(formData.repite === 'semanal' || formData.repite === 'custom') && (
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Días de la semana</p>
                                    <div className="flex justify-between gap-1">
                                        {DIAS_SEMANA.map(dia => (
                                            <button
                                                key={dia.id}
                                                type="button"
                                                onClick={() => toggleDiaSemana(dia.id)}
                                                className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all ${formData.dias_semana.includes(dia.id)
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                                    : 'bg-white border-slate-200 text-slate-400 hover:border-blue-300'
                                                    }`}
                                            >
                                                {dia.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-200 space-y-3">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Finalización</p>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 text-sm cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="fin_tipo"
                                            value="repeticiones"
                                            checked={formData.fin_tipo === 'repeticiones'}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-slate-600">Tras</span>
                                        <input
                                            type="number"
                                            name="fin_repeticiones"
                                            min="1"
                                            value={formData.fin_repeticiones}
                                            onChange={handleChange}
                                            disabled={formData.fin_tipo !== 'repeticiones'}
                                            className="w-16 rounded border-slate-300 p-1 text-center disabled:opacity-40"
                                        />
                                        <span className="text-slate-600">veces</span>
                                    </label>

                                    <label className="flex items-center gap-3 text-sm cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="fin_tipo"
                                            value="fecha"
                                            checked={formData.fin_tipo === 'fecha'}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-slate-600">El día</span>
                                        <input
                                            type="date"
                                            name="fin_fecha"
                                            value={formData.fin_fecha}
                                            onChange={handleChange}
                                            disabled={formData.fin_tipo !== 'fecha'}
                                            className="rounded border-slate-300 p-1 outline-none text-xs focus:ring-1 focus:ring-blue-500 disabled:opacity-40"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className={`px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:translate-y-0 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Procesando...
                        </span>
                    ) : 'Guardar y Reservar'}
                </button>
            </div>
        </form>
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

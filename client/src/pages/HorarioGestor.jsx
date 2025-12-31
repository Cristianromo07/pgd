import React, { useEffect, useState } from 'react';
import api from '../api';

const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

export default function HorarioGestor() {
    const [scenarios, setScenarios] = useState([]);
    const [selected, setSelected] = useState('');
    const [schedule, setSchedule] = useState({});

    useEffect(() => {
        api.get('/escenarios')
            .then(res => {
                setScenarios(res.data);
                const inter = res.data.find(s => s.nombre && s.nombre.toLowerCase().includes('intermunicipal'));
                if (inter) setSelected(inter.id);
                else if (res.data.length) setSelected(res.data[0].id);
            })
            .catch(err => console.error('No se pudieron cargar escenarios', err));
    }, []);

    useEffect(() => {
        // inicializar schedule para el escenario seleccionado
        if (!selected) return;
        const init = {};
        DAYS.forEach(d => init[d] = 'Turno 06:00 - 13:30');
        setSchedule(init);
    }, [selected]);

    const setDay = (day, value) => {
        setSchedule(prev => ({ ...prev, [day]: value }));
    };

    const handleSave = () => {
        // Actualmente guardado localmente; integrar con backend si se requiere
        alert('Horario guardado (solo localmente en esta interfaz).');
        console.log('Horario para escenario', selected, schedule);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Horario Gestor</h2>
            <p className="text-sm text-gray-600 mb-4">Define el horario semanal para un escenario (ej. Intermunicipal). Turno por defecto: 06:00 - 13:30.</p>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Escenario</label>
                <select value={selected} onChange={e => setSelected(e.target.value)} className="w-full md:w-1/2 p-2 border rounded">
                    <option value="">-- Seleccionar escenario --</option>
                    {scenarios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr>
                            <th className="border px-3 py-2 text-left">Día</th>
                            <th className="border px-3 py-2 text-left">Estado / Turno</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DAYS.map(day => (
                            <tr key={day}>
                                <td className="border px-3 py-2 align-top">{day}</td>
                                <td className="border px-3 py-2">
                                    <select value={schedule[day] || ''} onChange={e => setDay(day, e.target.value)} className="w-full p-2 border rounded">
                                        <option value="Turno 06:00 - 13:30">Turno 06:00 - 13:30</option>
                                        <option value="Día de descanso">Día de descanso</option>
                                        <option value="Apoyo: Polideportivo">Apoyo: Polideportivo</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex gap-2">
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Guardar</button>
                <button onClick={() => { setSelected(''); setSchedule({}); }} className="px-4 py-2 border rounded">Limpiar</button>
            </div>
        </div>
    );
}

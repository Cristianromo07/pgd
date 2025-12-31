import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api';
import ReservaForm from '../components/ReservaForm';

export default function SchedulePage() {
    const [scenarios, setScenarios] = useState([]);
    const [events, setEvents] = useState([]);
    const [filterScenario, setFilterScenario] = useState('');
    const [showForm, setShowForm] = useState(false);

    const calendarRef = useRef(null);

    useEffect(() => {
        // Cargar escenarios para el filtro y el formulario
        api.get('/escenarios').then(res => {
            setScenarios(res.data);
            if (res.data.length > 0) {
                setFilterScenario(res.data[0].id);
            }
        });
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [filterScenario]);

    const fetchEvents = async () => {
        if (!filterScenario) return;
        try {
            const res = await api.get('/reservas', {
                params: { escenario_id: filterScenario }
            });

            const mappedEvents = res.data.map(r => ({
                id: r.id,
                title: `${r.usuario_email}`,
                start: `${r.fecha.split('T')[0]}T${r.hora_inicio}`,
                end: `${r.fecha.split('T')[0]}T${r.hora_fin}`,
                backgroundColor: getColorHex(r.color),
                borderColor: getColorHex(r.color),
                extendedProps: { ...r }
            }));

            setEvents(mappedEvents);
        } catch (err) {
            console.error('Error al cargar eventos:', err);
        }
    };

    const handleSuccess = () => {
        setShowForm(false);
        fetchEvents();
    };

    return (
        <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Calendario de Reservas 📅</h1>
                    <p className="text-sm text-gray-500">Gestiona y visualiza las reservas de los escenarios deportivos.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${showForm ? 'bg-gray-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    {showForm ? '✖ Cerrar Formulario' : '＋ Nueva Reserva'}
                </button>
            </div>

            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ReservaForm escenarios={scenarios} onSuccess={handleSuccess} />
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-lg border">
                <div className="mb-6 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="font-bold text-gray-700">Filtrar por Escenario:</label>
                        <select
                            className="bg-white border-gray-300 border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            value={filterScenario}
                            onChange={(e) => setFilterScenario(e.target.value)}
                        >
                            <option value="">-- Seleccionar --</option>
                            {scenarios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                        </select>
                    </div>
                </div>

                <div className="h-[700px] border rounded-lg overflow-hidden">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        locale="es"
                        buttonText={{
                            today: 'Hoy',
                            month: 'Mes',
                            week: 'Semana',
                            day: 'Día'
                        }}
                        slotMinTime="06:00:00"
                        slotMaxTime="23:00:00"
                        allDaySlot={false}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true}
                        events={events}
                        height="100%"
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            meridiem: false,
                            hour12: false
                        }}
                    />
                </div>
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

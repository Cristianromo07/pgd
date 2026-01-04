import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api';
import BookingModal from '../components/BookingModal';
import ReportNewsForm from '../components/ReportNewsForm';

export default function SubgerenciaPage({ user }) {
    const navigate = useNavigate();
    const [scenarios, setScenarios] = useState([]);
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [filterScenario, setFilterScenario] = useState('');

    const [activeTab, setActiveTab] = useState('calendar');

    const calendarRef = useRef(null);

    useEffect(() => {
        // Cargar escenarios
        api.get('/escenarios').then(res => {
            setScenarios(res.data);
            if (res.data.length > 0) {
                setFilterScenario(res.data[0].id);
            }
        });
    }, []);

    useEffect(() => {
        if (activeTab === 'calendar') {
            fetchEvents();
        }
    }, [filterScenario, activeTab]);

    const fetchEvents = async () => {
        if (!filterScenario) return;
        try {
            const res = await api.get('/reservas', {
                params: { escenario_id: filterScenario }
            });

            const mappedEvents = res.data.map(r => ({
                id: r.id,
                title: `${r.usuario_email} (${r.escenario_nombre})`,
                start: `${r.fecha.split('T')[0]}T${r.hora_inicio}`,
                end: `${r.fecha.split('T')[0]}T${r.hora_fin}`,
                backgroundColor: getColorHex(r.color),
                borderColor: getColorHex(r.color),
                extendedProps: { ...r }
            }));

            setEvents(mappedEvents);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDateSelect = (selectInfo) => {
        // Preparar datos para el modal
        const startStr = selectInfo.startStr;
        const endStr = selectInfo.endStr;

        const dateObj = new Date(startStr);
        const date = dateObj.toISOString().split('T')[0];
        const startTime = dateObj.toTimeString().split(' ')[0].substring(0, 5);
        const endTime = new Date(endStr).toTimeString().split(' ')[0].substring(0, 5);

        setCurrentEvent({
            escenario_id: filterScenario,
            fecha: date,
            hora_inicio: startTime,
            hora_fin: endTime,
            color: 'azul'
        });
        setIsModalOpen(true);
    };

    const handleEventClick = (clickInfo) => {
        const props = clickInfo.event.extendedProps;
        setCurrentEvent({
            id: props.id,
            escenario_id: props.escenario_id,
            fecha: props.fecha.split('T')[0],
            hora_inicio: props.hora_inicio,
            hora_fin: props.hora_fin,
            color: props.color
        });
        setIsModalOpen(true);
    };

    const saveBooking = async (formData) => {
        try {
            if (formData.id) {
                // Actualizar una sola instancia
                await api.put(`/reservas/${formData.id}`, formData);
                alert('Reserva actualizada');
            } else {
                // Crear (posiblemente múltiples en el backend)
                const res = await api.post('/reservas', formData);
                alert(res.data.message || 'Reserva(s) creada(s) con éxito!');
            }
            setIsModalOpen(false);
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.error || 'Error al procesar la reserva');
        }
    };

    const deleteBooking = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta reserva?')) return;
        try {
            await api.delete(`/reservas/${id}`);
            setIsModalOpen(false);
            fetchEvents();
            alert('Reserva eliminada');
        } catch (err) {
            alert(err.response?.data?.error || 'Error al eliminar');
        }
    };

    return (
        <div className="subgerencia-page bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[85vh]">
            {/* Header Interno */}
            <div className="bg-slate-700 text-white p-4 flex justify-between items-center">
                <h2 className="text-lg font-bold">Subgerencia de Escenarios</h2>
                {/* Navigation Tabs */}
                <div className="flex bg-slate-600 rounded p-1 gap-1">
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`px-3 py-1 rounded text-sm transition-colors ${activeTab === 'calendar' ? 'bg-white text-slate-800' : 'text-gray-200 hover:bg-slate-500'
                            }`}
                    >
                        Calendario
                    </button>
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`px-3 py-1 rounded text-sm transition-colors ${activeTab === 'report' ? 'bg-white text-slate-800' : 'text-gray-200 hover:bg-slate-500'
                            }`}
                    >
                        Reportar Novedad
                    </button>
                    <button
                        onClick={() => navigate('/subgerencia-escenarios/horario-gestor')}
                        className={`px-3 py-1 rounded text-sm transition-colors ${activeTab === 'horario' ? 'bg-white text-slate-800' : 'text-gray-200 hover:bg-slate-500'
                            }`}
                    >
                        Horario Gestor
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
                {activeTab === 'calendar' && (
                    <>
                        <div className="mb-4 flex items-center gap-2">
                            <label className="font-semibold text-gray-700">Filtrar por Escenario:</label>
                            <select
                                className="bg-white border border-gray-300 text-gray-700 p-2 rounded focus:ring-blue-500 focus:border-blue-500"
                                value={filterScenario}
                                onChange={(e) => setFilterScenario(e.target.value)}
                            >
                                <option value="">-- Seleccionar --</option>
                                {scenarios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                            </select>
                        </div>

                        <div className="calendar-frame">
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
                                slotMinTime="06:00:00"
                                slotMaxTime="23:00:00"
                                allDaySlot={false}
                                selectable={true}
                                selectMirror={true}
                                dayMaxEvents={true}
                                weekends={true}
                                events={events}
                                select={handleDateSelect}
                                eventClick={handleEventClick}
                                height="100%"
                            />
                        </div>
                    </>
                )}

                {activeTab === 'report' && (
                    <div className="max-w-3xl mx-auto">
                        <ReportNewsForm scenarios={scenarios} />
                    </div>
                )}
            </div>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={saveBooking}
                onDelete={deleteBooking}
                initialData={currentEvent}
                scenarios={scenarios}
            />
        </div>
    );
}

function getColorHex(colorName) {
    switch (colorName) {
        case 'rojo': return '#ef4444';
        case 'azul': return '#3b82f6';
        case 'amarillo': return '#eab308';
        case 'naranja': return '#f97316';
        case 'violeta': return '#a855f7';
        default: return '#3b82f6';
    }
}

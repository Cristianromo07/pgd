import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api';
import BookingModal from '../components/BookingModal';
import { ArrowLeft, Plus, History, Clock, Calendar } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { Escenario } from '../types/horario';

export default function SubgerenciaPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [scenarios, setScenarios] = useState<Escenario[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<any>(null);
    const [filterScenario, setFilterScenario] = useState<string>('');

    const calendarRef = useRef<FullCalendar>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const res = await api.get('/escenarios');
                setScenarios(res.data);
                if (res.data.length > 0) {
                    setFilterScenario(res.data[0].id.toString());
                }
            } catch (err) {
                console.error("Error cargando escenarios:", err);
            }
        };
        loadInitialData();
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

            const mappedEvents = res.data.map((r: any) => ({
                id: r.id,
                title: `${r.descripcion_actividad || 'SIN DESCRIPCIÓN'} - ${r.nombre_solicitante || r.usuario_email}`,
                start: `${r.fecha.split('T')[0]}T${r.hora_inicio}`,
                end: `${r.fecha.split('T')[0]}T${r.hora_fin}`,
                backgroundColor: getColorHex(r.color),
                borderColor: getColorHex(r.color),
                extendedProps: { ...r }
            }));

            setEvents(mappedEvents);
        } catch (err) {
            console.error("Error al obtener eventos:", err);
        }
    };

    const handleDateSelect = (selectInfo: any) => {
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

    const handleEventClick = (clickInfo: any) => {
        const props = clickInfo.event.extendedProps;
        setCurrentEvent({
            id: props.id,
            escenario_id: props.escenario_id,
            fecha: props.fecha.split('T')[0],
            hora_inicio: props.hora_inicio,
            hora_fin: props.hora_fin,
            color: props.color,
            nombre_solicitante: props.nombre_solicitante,
            telefono_solicitante: props.telefono_solicitante,
            descripcion_actividad: props.descripcion_actividad
        });
        setIsModalOpen(true);
    };

    const saveBooking = async (formData: any) => {
        try {
            if (formData.id) {
                await api.put(`/reservas/${formData.id}`, formData);
                alert('Reserva actualizada');
            } else {
                const res = await api.post('/reservas', formData);
                alert(res.data.message || 'Reserva(s) creada(s) con éxito!');
            }
            setIsModalOpen(false);
            fetchEvents();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al procesar la reserva');
        }
    };

    const deleteBooking = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta reserva?')) return;
        try {
            await api.delete(`/reservas/${id}`);
            setIsModalOpen(false);
            fetchEvents();
            alert('Reserva eliminada');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al eliminar');
        }
    };

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-medium text-slate-800">
            <header className="h-[52px] bg-white border-b border-slate-200 px-4 flex items-center justify-between z-50">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-1 hover:bg-slate-100 rounded transition-all border border-transparent hover:border-slate-200"
                    >
                        <ArrowLeft size={16} className="text-slate-500" />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-slate-900 uppercase tracking-tight leading-none">
                            Subgerencia Escenarios
                        </h1>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">En Vivo</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 px-1.5 py-1 rounded-lg border border-slate-200">
                    <select
                        className="bg-white border border-slate-200 rounded-md text-[10px] font-bold px-3 py-1 outline-none text-slate-700 shadow-sm min-w-[200px]"
                        value={filterScenario}
                        onChange={(e) => setFilterScenario(e.target.value)}
                    >
                        <option value="">Seleccione Escenario...</option>
                        {scenarios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => navigate('/subgerencia-escenarios/reportar')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-md font-bold text-[9px] uppercase hover:bg-red-700 transition-all shadow-sm"
                    >
                        <Plus size={12} /> Reportar
                    </button>
                    <button
                        onClick={() => navigate('/subgerencia-escenarios/novedades')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-bold text-[9px] uppercase hover:bg-white border border-slate-200 transition-all"
                    >
                        <History size={12} /> Novedades
                    </button>
                    <button
                        onClick={() => navigate('/subgerencia-escenarios/horario-gestor')}
                        className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-md font-bold text-[9px] uppercase hover:bg-blue-700 transition-all shadow-sm"
                    >
                        <Clock size={12} /> Horarios
                    </button>
                </div>
            </header>

            <main className="flex-1 p-2 overflow-hidden flex flex-col">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full p-4 overflow-auto">
                    {!filterScenario ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
                            <Calendar size={48} className="text-slate-300" strokeWidth={1.5} />
                            <p className="font-bold text-xs uppercase tracking-[0.1em] text-center max-w-[200px] leading-relaxed">
                                Seleccione un escenario para visualizar el calendario
                            </p>
                        </div>
                    ) : (
                        <div className="h-full calendar-premium">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek'
                                }}
                                buttonText={{
                                    today: 'Hoy',
                                    month: 'Mes',
                                    week: 'Semana'
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
                    )}
                </div>
            </main>

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={saveBooking}
                onDelete={deleteBooking}
                initialData={currentEvent}
                scenarios={scenarios}
            />

            <style>{`
                .calendar-premium .fc {
                    --fc-border-color: #f1f5f9;
                    --fc-today-bg-color: #f8fafc;
                    --fc-button-bg-color: #ffffff;
                    --fc-button-border-color: #e2e8f0;
                    --fc-button-text-color: #475569;
                    --fc-button-hover-bg-color: #f1f5f9;
                    --fc-button-hover-border-color: #cbd5e1;
                    --fc-button-active-bg-color: #3b82f6;
                    --fc-button-active-border-color: #3b82f6;
                    --fc-event-bg-color: #3b82f6;
                    --fc-event-border-color: #3b82f6;
                    font-family: inherit;
                    font-size: 11px;
                }
                .calendar-premium .fc-toolbar-title {
                    font-weight: 800 !important;
                    text-transform: uppercase;
                    font-size: 12px !important;
                    color: #1e293b;
                    letter-spacing: 0.05em;
                }
                .calendar-premium .fc-button {
                    border-radius: 6px !important;
                    padding: 4px 10px !important;
                    font-weight: 700 !important;
                    font-size: 9px !important;
                    text-transform: uppercase !important;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
                }
                .calendar-premium .fc-button-primary:not(:disabled).fc-button-active, 
                .calendar-premium .fc-button-primary:not(:disabled):active {
                    color: white !important;
                    background-color: #0f172a !important;
                    border-color: #0f172a !important;
                }
                .calendar-premium .fc-col-header-cell {
                    padding: 8px 0 !important;
                    background: #f8fafc;
                    border-bottom: 2px solid #e2e8f0 !important;
                }
                .calendar-premium .fc-col-header-cell-cushion {
                    font-weight: 800 !important;
                    text-transform: uppercase;
                    color: #64748b;
                    font-size: 10px;
                }
                .calendar-premium .fc-timegrid-slot {
                    height: 2.5rem !important;
                }
                .calendar-premium .fc-event {
                    border-radius: 4px !important;
                    border: none !important;
                    padding: 2px 4px !important;
                    font-weight: 700 !important;
                    font-size: 9px !important;
                    text-transform: uppercase;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                }
            `}</style>
        </div>
    );
}

function getColorHex(colorName: string) {
    switch (colorName) {
        case 'rojo': return '#ef4444';
        case 'azul': return '#3b82f6';
        case 'amarillo': return '#eab308';
        case 'naranja': return '#f97316';
        case 'violeta': return '#a855f7';
        default: return '#3b82f6';
    }
}

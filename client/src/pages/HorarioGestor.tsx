// HorarioGestor.tsx - Gestión de turnos y gestores
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { exportToExcel } from '../utils/exportUtils';
import { Search, Plus, UserPlus, Trash2, Edit2, Save, ArrowLeft, X, Shield, Phone, AlertTriangle, AlertCircle, FileDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { normalize } from '../utils/stringUtils';
import { Gestor, EscenarioData, ActiveGap, DAYS, TURNO_PRESETS, ALLOWED_ESCENARIOS } from '../types/horario';
import ReplacementModal from '../components/ReplacementModal';
import AddGestorModal from '../components/AddGestorModal';

export default function HorarioGestor() {
    const navigate = useNavigate();
    const { date: routeDate } = useParams();

    // Obtener el lunes de la semana en formato YYYY-MM-DD, seguro para zonas horarias
    const getMonday = (dateInput: string | Date): string => {
        const d = new Date(dateInput);
        if (typeof dateInput === 'string' && !dateInput.includes('T')) {
            d.setHours(12, 0, 0, 0); // Evitar desfases horarias por fechas planas
        }
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d);
        monday.setDate(diff);
        return monday.toISOString().split('T')[0];
    };

    const [currentWeek, setCurrentWeek] = useState<string>(routeDate ? getMonday(routeDate) : getMonday(new Date()));
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEscenario, setSelectedEscenario] = useState('Todos');
    const [filterEmpty, setFilterEmpty] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showReplacementModal, setShowReplacementModal] = useState(false);
    const [activeGap, setActiveGap] = useState<ActiveGap | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [data, setData] = useState<EscenarioData[]>([]);
    const [allEscenarios, setAllEscenarios] = useState<any[]>([]);
    const [allowedEscenarios, setAllowedEscenarios] = useState<string[]>([]);
    const [dirtyRows, setDirtyRows] = useState(new Set<string>());
    const [newGestor, setNewGestor] = useState({ nombre: '', contacto: '', escenario: '' });

    useEffect(() => {
        if (routeDate) {
            const mon = getMonday(routeDate);
            if (mon !== currentWeek) setCurrentWeek(mon);
        }
    }, [routeDate]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [escResponse, horarioResponse] = await Promise.all([
                api.get('/escenarios'),
                api.get(`/horarios?date=${currentWeek}`)
            ]);

            const fetchedEscenarios = escResponse.data;
            setAllEscenarios(fetchedEscenarios);
            setAllowedEscenarios(fetchedEscenarios.map((e: any) => e.nombre));

            const dbData = horarioResponse.data;

            const structured: EscenarioData[] = fetchedEscenarios.map((esc: any) => {
                const gestoresMatches = dbData.filter((d: any) => {
                    // Coincidencia robusta por nombre de escenario o ID
                    // Algunos datos antiguos pueden no tener escenario_id
                    return d.escenario_id === esc.id || d.escenario === esc.nombre;
                });

                return {
                    escenario: esc.nombre,
                    id: esc.id,
                    gestores: gestoresMatches.map((d: any) => ({
                        id: d.id,
                        nombre: d.gestor_nombre,
                        contacto: d.contacto,
                        turnos: [d.lunes, d.martes, d.miercoles, d.jueves, d.viernes, d.sabado, d.domingo].map(t => t || "")
                    })),
                    gaps: []
                };
            });

            setData(structured);
        } catch (err: any) {
            console.error("Error cargando datos:", err);
            setError("Error al cargar datos: " + (err.response?.data?.error || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [currentWeek]);

    const changeWeek = (offset: number) => {
        const d = new Date(currentWeek + 'T12:00:00'); // Usar el mediodía para evitar problemas de zona horaria
        d.setDate(d.getDate() + (offset * 7));
        const newMon = getMonday(d);
        navigate(`/subgerencia-escenarios/horario-gestor/${newMon}`);
    };

    const dataWithGaps = useMemo(() => {
        return data.map(item => {
            const gaps: { day: number; shift: string }[] = [];
            if (normalize(item.escenario) !== 'ciclovia') {
                for (let i = 0; i < 7; i++) {
                    ['MAÑANA', 'TARDE'].forEach(shift => {
                        const shiftKey = shift === 'MAÑANA' ? '6:00' : '2:30';
                        const directCover = item.gestores.some(g => (g.turnos[i] || '').toUpperCase().includes(shiftKey));

                        let crossCover = false;
                        if (!directCover) {
                            data.forEach(otherEsc => {
                                otherEsc.gestores.forEach(g => {
                                    const t = (g.turnos[i] || '').toUpperCase();
                                    if (t.includes(shiftKey) && t.includes(item.escenario.toUpperCase())) {
                                        crossCover = true;
                                    }
                                });
                            });
                        }

                        if (!directCover && !crossCover) {
                            gaps.push({ day: i, shift: shift });
                        }
                    });
                }
            }
            return { ...item, gaps };
        });
    }, [data]);

    const filteredData = useMemo(() => {
        return dataWithGaps.map(item => {
            const isCicloviaFilter = selectedEscenario === 'Ciclovía';
            const filteredG = item.gestores.filter(g => {
                const searchLower = searchTerm.toLowerCase();
                const matchesName = g.nombre.toLowerCase().includes(searchLower);
                const matchesTurno = g.turnos.some(t => (t || '').toLowerCase().includes(searchLower));

                if (!matchesName && !matchesTurno) return false;

                if (isCicloviaFilter) {
                    const hasCicloviaTurn = g.turnos.some(t => t.toUpperCase().includes('CICLOVIA'));
                    const isCicloviaEsc = normalize(item.escenario) === 'ciclovia';
                    return hasCicloviaTurn || isCicloviaEsc;
                }
                return true;
            });

            if (selectedEscenario !== 'Todos' && !isCicloviaFilter && item.escenario !== selectedEscenario) return null;
            if (isCicloviaFilter && filteredG.length === 0) return null;

            const hasGaps = item.gaps.length > 0;
            const isTotallyEmpty = item.gestores.length === 0;

            if (searchTerm !== '') {
                if (filteredG.length === 0) return null;
            } else if (filterEmpty) {
                if (!hasGaps) return null;
            } else {
                if (isTotallyEmpty && !hasGaps) return null;
                if (isTotallyEmpty) return null;
            }

            return { ...item, gestores: filteredG };
        }).filter((item): item is EscenarioData => item !== null);
    }, [dataWithGaps, searchTerm, selectedEscenario, filterEmpty]);

    const emptyCount = useMemo(() => dataWithGaps.filter(e => e.gaps.length > 0).length, [dataWithGaps]);

    const handleUpdate = (escIdx: number, gIdx: number, field: string, val: string, dayIdx: number | null = null) => {
        const newData = [...data];
        if (dayIdx !== null) {
            newData[escIdx].gestores[gIdx].turnos[dayIdx] = val;
        } else {
            (newData[escIdx].gestores[gIdx] as any)[field] = val;
        }
        setData([...newData]);
        setDirtyRows(prev => new Set(prev).add(`${newData[escIdx].escenario}-${newData[escIdx].gestores[gIdx].nombre}`));
    };

    const handleSave = async () => {
        const toSave: any[] = [];
        data.forEach(esc => {
            const escMaster = allEscenarios.find(e => e.nombre === esc.escenario);
            esc.gestores.forEach(g => {
                if (dirtyRows.has(`${esc.escenario}-${g.nombre}`)) {
                    toSave.push({
                        escenario: esc.escenario,
                        escenario_id: escMaster?.id,
                        gestor_nombre: g.nombre,
                        contacto: g.contacto,
                        turnos: g.turnos,
                        fecha_inicio: currentWeek
                    });
                }
            });
        });
        if (toSave.length === 0) return setIsEditMode(false);
        try {
            await api.post('/horarios', { entries: toSave });
            setDirtyRows(new Set());
            setIsEditMode(false);
            alert("Cambios guardados con éxito.");
            loadData();
        } catch (err: any) { alert("Error al guardar: " + (err.response?.data?.error || err.message)); }
    };

    const handleDelete = async (esc: string, nom: string) => {
        if (!window.confirm(`¿Seguro que quieres eliminar a ${nom}?`)) return;
        try {
            await api.delete(`/horarios/${encodeURIComponent(esc)}/${encodeURIComponent(nom)}`);
            loadData();
        } catch (e) { alert("Error al eliminar."); }
    };

    const handleAdd = async () => {
        if (!newGestor.nombre || !newGestor.escenario) return alert("Nombre y Sede son obligatorios");

        const escMaster = allEscenarios.find(e => e.nombre === newGestor.escenario);

        const entry = {
            escenario: newGestor.escenario,
            escenario_id: escMaster?.id,
            gestor_nombre: newGestor.nombre.toUpperCase(),
            contacto: newGestor.contacto,
            turnos: ["", "", "", "", "", "", ""],
            fecha_inicio: currentWeek
        };

        try {
            await api.post('/horarios', { entries: [entry] });
            alert("Gestor registrado y guardado en base de datos.");
            setShowAddModal(false);
            setNewGestor({ nombre: '', contacto: '', escenario: '' });
            loadData();
        } catch (err: any) {
            alert("Error al registrar: " + (err.response?.data?.error || err.message));
        }
    };

    const handleAssignReplacement = async (gestor: Gestor) => {
        if (!activeGap) return;

        let sourceEntry: any = null;
        for (const esc of data) {
            const found = esc.gestores.find(g => g.nombre === gestor.nombre);
            if (found) {
                sourceEntry = { ...found, escName: esc.escenario, escId: esc.id };
                break;
            }
        }

        if (!sourceEntry) return;

        const baseShift = activeGap.shift === 'MAÑANA' ? '6:00 1:30' : '2:30 10:00';
        const newTurnos = [...sourceEntry.turnos];
        const currentVal = (newTurnos[activeGap.day] || '');

        if (currentVal.toUpperCase().includes(baseShift)) {
            newTurnos[activeGap.day] = `${currentVal} ${activeGap.escenario.toUpperCase()}+`;
        } else {
            newTurnos[activeGap.day] = `${baseShift} ${activeGap.escenario.toUpperCase()}+`;
        }

        const payload = {
            id: sourceEntry.id,
            escenario: sourceEntry.escName,
            escenario_id: sourceEntry.escId,
            gestor_nombre: sourceEntry.nombre,
            contacto: sourceEntry.contacto,
            turnos: newTurnos,
            fecha_inicio: currentWeek
        };

        try {
            await api.post('/horarios', { entries: [payload] });
            alert(`Sustitución consolidada en ${gestor.nombre}`);
            setShowReplacementModal(false);
            setActiveGap(null);
            loadData();
        } catch (err: any) {
            alert("Error: " + (err.response?.data?.error || err.message));
        }
    };

    const handleExportExcel = () => {
        if (!filteredData || filteredData.length === 0) return alert("No hay datos para exportar");
        exportToExcel(filteredData, currentWeek);
    };

    const getTurnoStyle = (t: string) => {
        const v = (t || '').toUpperCase();
        if (!v) return 'bg-white text-slate-300';
        if (v.includes('DESCANSO')) return 'bg-rose-50 text-rose-700 border-rose-200';
        if (v.includes('INCAPACITADA')) return 'bg-amber-50 text-amber-700 border-amber-200';
        if (v.includes('VACACIONES')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (v.includes('CICLOVIA')) return 'bg-purple-50 text-purple-700 border-purple-200';
        if (v.includes('D. PROGRAMADO')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        const isBase = (v.includes('6:00') || v.includes('2:30'));
        if (isBase) return 'bg-white text-black border-slate-200';
        return 'bg-blue-50 text-blue-800 border-blue-200 shadow-sm';
    };

    return (
        <div className="h-screen flex flex-col bg-slate-100 overflow-hidden text-black font-medium">
            <header className="h-[52px] bg-white border-b border-slate-200 px-4 flex items-center justify-between z-50">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-slate-100 rounded transition-all text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200">
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Horario Gestor</h1>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-50 rounded-md p-0.5 border border-slate-200 shadow-sm">
                        <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-900 transition-all"><ChevronLeft size={16} /></button>
                        <div className="px-2 flex items-center gap-1.5 border-x border-slate-100">
                            <Calendar size={12} className="text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase">Semana del {new Date(currentWeek + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                        </div>
                        <button onClick={() => changeWeek(1)} className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-900 transition-all"><ChevronRight size={16} /></button>
                    </div>

                    {emptyCount > 0 && (
                        <button
                            onClick={() => setFilterEmpty(!filterEmpty)}
                            className={`flex items-center gap-2 px-2 py-1 rounded-md font-bold text-[9px] uppercase transition-all ${filterEmpty ? 'bg-orange-600 text-white shadow-sm' : 'bg-red-50 text-red-600 border border-red-100'}`}
                        >
                            <AlertTriangle size={11} /> {emptyCount} VACANTES
                        </button>
                    )}

                    <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-md border border-slate-200">
                        <div className="relative flex items-center bg-white rounded border border-slate-200 px-1.5 py-0.5">
                            <Search className="text-slate-300" size={11} />
                            <input type="text" placeholder="Buscar..." className="bg-transparent border-none text-[10px] font-bold w-24 outline-none ml-1 text-slate-800" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <select className="bg-white border border-slate-200 rounded text-[10px] font-bold px-1.5 py-0.5 outline-none text-slate-600 appearance-none cursor-pointer hover:bg-slate-50" value={selectedEscenario} onChange={e => setSelectedEscenario(e.target.value)}>
                            <option value="Todos">Sedes</option>
                            <option value="Ciclovía">Ciclovía</option>
                            {allowedEscenarios.filter(e => e !== 'Ciclovía').map(esc => <option key={esc} value={esc}>{esc}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white text-slate-600 border border-slate-200 rounded-md font-bold text-[9px] uppercase hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <FileDown size={12} className="text-emerald-600" /> Exportar
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-white border border-slate-900 rounded-md font-bold text-[9px] uppercase hover:bg-slate-900 transition-all shadow-sm">
                        <UserPlus size={12} /> Alta
                    </button>
                    {isEditMode ? (
                        <button onClick={handleSave} className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-md font-bold text-[9px] uppercase shadow-md animate-pulse">
                            <Save size={12} /> Guardar
                        </button>
                    ) : (
                        <button onClick={() => setIsEditMode(true)} className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-bold text-[9px] uppercase hover:bg-white transition-all">
                            <Edit2 size={12} className="text-blue-600" /> Gestionar
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-hidden p-2 flex flex-col">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-2 mb-2 rounded-lg text-[10px] font-bold flex justify-between items-center shadow-sm">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}><X size={12} /></button>
                    </div>
                )}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-auto h-full no-scrollbar relative">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Cargando Datos...</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse table-fixed min-w-[1900px]">
                            <thead className="sticky top-0 z-40">
                                <tr className="bg-slate-900">
                                    <th className="w-[120px] p-2 text-[9px] font-bold text-slate-400 uppercase text-left sticky left-0 bg-slate-900 border-r border-slate-800">Sede</th>
                                    <th className="w-[150px] p-2 text-[9px] font-bold text-slate-400 uppercase text-left border-r border-slate-800">Funcionario</th>
                                    <th className="w-[100px] p-2 text-[9px] font-bold text-slate-400 uppercase text-center border-r border-slate-800">Contacto</th>
                                    {DAYS.map(d => <th key={d} className="p-2 text-[9px] font-bold text-slate-400 uppercase text-center border-r border-slate-800">{d}</th>)}
                                    {isEditMode && <th className="w-[60px] bg-red-900/50 border-l border-slate-800 text-[9px] text-white font-bold text-center uppercase">Acción</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.map((item, escIdx) => (
                                    <React.Fragment key={item.escenario}>
                                        {item.gestores.length > 0 ? (
                                            item.gestores.map((g, gIdx) => {
                                                const isEven = escIdx % 2 === 0;
                                                const bg = isEven ? 'bg-white' : 'bg-slate-50';

                                                return (
                                                    <tr key={`${item.escenario}-${g.nombre}`} className={`${bg} transition-all hover:bg-blue-50/50 group`}>
                                                        {gIdx === 0 && (
                                                            <td rowSpan={item.gestores.length} className={`p-2 sticky left-0 ${bg} z-30 border-r-2 border-slate-200 font-bold text-[10px] uppercase text-slate-800 align-middle leading-tight`}>
                                                                {item.escenario}
                                                            </td>
                                                        )}
                                                        <td className="p-2 border-r border-slate-100 font-bold text-[10px] uppercase text-slate-900">{g.nombre}</td>
                                                        <td className="p-1.5 border-r border-slate-100 text-center">
                                                            {isEditMode ? (
                                                                <input type="text" className="w-full p-1 bg-white border border-slate-200 rounded text-[9px] font-bold text-center text-slate-800 outline-none" value={g.contacto} onChange={e => handleUpdate(data.indexOf(item), gIdx, 'contacto', e.target.value)} />
                                                            ) : (
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <Phone size={10} className="text-slate-400" />
                                                                    <span className="text-[10px] font-bold text-slate-600">{g.contacto || '---'}</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        {g.turnos.map((t, tIdx) => (
                                                            <td key={tIdx} className="p-1 border-r border-slate-100 align-middle">
                                                                {isEditMode ? (
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <select className="w-full p-1 bg-white border border-slate-200 rounded text-[9px] font-bold text-center" value={TURNO_PRESETS.includes(t) ? t : "custom"} onChange={e => {
                                                                            if (e.target.value !== "custom") {
                                                                                handleUpdate(data.indexOf(item), gIdx, 'turnos', e.target.value, tIdx);
                                                                            }
                                                                        }}>
                                                                            <option value="custom">✍️</option>
                                                                            {TURNO_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                                                                        </select>
                                                                        <input type="text" className="w-full p-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-center" value={t} onChange={e => handleUpdate(data.indexOf(item), gIdx, 'turnos', e.target.value, tIdx)} />
                                                                    </div>
                                                                ) : (
                                                                    <div className={`mx-auto p-1 rounded border text-[9px] font-bold text-center leading-none min-w-[90px] shadow-sm uppercase ${getTurnoStyle(t)}`}>
                                                                        {t || '---'}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        ))}
                                                        {isEditMode && (
                                                            <td className="text-center p-1 bg-red-50">
                                                                <button onClick={() => handleDelete(item.escenario, g.nombre)} className="p-1 text-red-400 hover:text-red-600 transition-all">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })
                                        ) : item.gaps.length > 0 ? (
                                            <tr className={escIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                <td className="p-2 sticky left-0 bg-inherit z-30 border-r-2 border-slate-200 font-bold text-[10px] uppercase text-slate-400">{item.escenario}</td>
                                                <td colSpan={DAYS.length + 3} className="p-2 text-center">
                                                    <div className="flex items-center justify-center gap-2 py-1">
                                                        <AlertCircle className="text-slate-300" size={14} />
                                                        <span className="text-slate-400 font-bold uppercase text-[9px] italic tracking-wider">Vacante</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : null}

                                        {item.gaps.length > 0 && (
                                            <tr className="bg-white border-t border-slate-100">
                                                <td className="p-2 sticky left-0 bg-white z-30 border-r-2 border-red-500 font-bold text-[9px] text-red-500 uppercase italic">⚠️ Alerta</td>
                                                <td className="p-2 font-bold text-[9px] text-slate-400 uppercase">Sin Cobertura:</td>
                                                <td className="border-r border-slate-50"></td>
                                                {DAYS.map((_, i) => {
                                                    const dayGaps = item.gaps.filter(g => g.day === i);
                                                    return (
                                                        <td key={i} className="p-1 border-r border-slate-50">
                                                            {dayGaps.length > 0 && (
                                                                <div className="flex flex-col gap-0.5">
                                                                    {dayGaps.map(g => (
                                                                        <button
                                                                            key={g.shift}
                                                                            onClick={() => {
                                                                                setActiveGap({ escenario: item.escenario, day: i, shift: g.shift });
                                                                                setShowReplacementModal(true);
                                                                            }}
                                                                            className="bg-red-500 text-white text-[8px] font-bold py-1 px-1.5 rounded text-center uppercase hover:bg-slate-900 transition-all"
                                                                        >
                                                                            {g.shift}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                {isEditMode && <td className="bg-red-50/50"></td>}
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>


            <AddGestorModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                newGestor={newGestor}
                setNewGestor={setNewGestor}
                onAdd={handleAdd}
                allowedEscenarios={allowedEscenarios}
            />


            <ReplacementModal
                isOpen={showReplacementModal}
                onClose={() => setShowReplacementModal(false)}
                activeGap={activeGap}
                data={data}
                onAssign={handleAssignReplacement}
            />
        </div>
    );
}

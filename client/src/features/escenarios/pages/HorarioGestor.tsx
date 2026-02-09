import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../../../api';
import { exportToExcel } from '../../../utils/exportUtils';
import { Search, UserPlus, Trash2, Edit2, Save, ArrowLeft, X, Phone, FileDown, AlertTriangle, AlertCircle, Upload, Layout } from 'lucide-react';
import { normalize } from '../../../utils/stringUtils';
import { Gestor, EscenarioData, ActiveGap, DAYS, TURNO_PRESETS } from '../../../types/horario';
import ReplacementModal from '../components/ReplacementModal';
import ManageEscenariosModal from '../components/ManageEscenariosModal';

export default function HorarioGestor() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados simplificados
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEscenario, setSelectedEscenario] = useState('Todos');
    const [filterEmpty, setFilterEmpty] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showEscenariosModal, setShowEscenariosModal] = useState(false);
    const [showReplacementModal, setShowReplacementModal] = useState(false);
    const [activeGap, setActiveGap] = useState<ActiveGap | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hidePassedDays, setHidePassedDays] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const [data, setData] = useState<EscenarioData[]>([]);
    const [allEscenarios, setAllEscenarios] = useState<any[]>([]);
    const [allowedEscenarios, setAllowedEscenarios] = useState<string[]>([]);
    const [dirtyRows, setDirtyRows] = useState(new Set<string>());
    const [newGestor, setNewGestor] = useState({ nombre: '', contacto: '', escenario: '' });

    // Carga de datos sin filtrado de fecha
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [escResponse, horarioResponse] = await Promise.all([
                api.get('/escenarios'),
                api.get('/horarios')
            ]);

            const fetchedEscenarios = escResponse.data;
            setAllEscenarios(fetchedEscenarios);
            setAllowedEscenarios(fetchedEscenarios.map((e: any) => e.nombre));

            const dbData = horarioResponse.data;

            const structured: EscenarioData[] = fetchedEscenarios.map((esc: any) => {
                const gestoresMatches = dbData.filter((d: any) => {
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

    useEffect(() => { loadData(); }, []);

    // Lógica de detección de vacantes (gaps)
    const dataWithGaps = useMemo(() => {
        return data.map(item => {
            const gaps: { day: number; shift: string }[] = [];
            if (normalize(item.escenario) !== 'ciclovia') {
                for (let i = 0; i < 7; i++) {
                    ['MAÑANA', 'TARDE'].forEach(shift => {
                        const shiftKey = shift === 'MAÑANA' ? '6 AM' : '12 PM';

                        // Cobertura Directa: El gestor está en este escenario y tiene el turno, 
                        // pero NO tiene el nombre de OTRO escenario en su turno.
                        const directCover = item.gestores.some(g => {
                            const t = (g.turnos[i] || '').toUpperCase();
                            if (!t.includes(shiftKey)) return false;

                            // Si el turno menciona otra sede, entonces no está cubriendo esta sede
                            const coversOther = allEscenarios.some(esc =>
                                esc.nombre !== item.escenario && t.includes(esc.nombre.toUpperCase())
                            );
                            return !coversOther;
                        });

                        let crossCover = false;
                        if (!directCover) {
                            // Cobertura Cruzada: Algún gestor de OTRA sede está asignado a esta sede
                            data.forEach(otherEsc => {
                                if (otherEsc.escenario === item.escenario) return;
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

    // Filtrado de búsqueda y sede
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

    const currentDayIdx = useMemo(() => {
        const d = new Date().getDay(); // 0 is Sunday, 1 is Monday...
        return d === 0 ? 6 : d - 1; // Map to 0=Mon, 6=Sun
    }, []);

    const visibleDaysIdx = useMemo(() => {
        if (!hidePassedDays) return [0, 1, 2, 3, 4, 5, 6];
        return [0, 1, 2, 3, 4, 5, 6].filter(i => i >= currentDayIdx);
    }, [hidePassedDays, currentDayIdx]);

    const handleUpdate = (escName: string, gestorName: string, field: string, val: string, dayIdx: number | null = null) => {
        setData(prevData => prevData.map(esc => {
            if (esc.escenario !== escName) return esc;
            return {
                ...esc,
                gestores: esc.gestores.map(g => {
                    if (g.nombre !== gestorName) return g;
                    const updatedG = { ...g };
                    if (dayIdx !== null) {
                        const newTurnos = [...g.turnos];
                        newTurnos[dayIdx] = val;
                        updatedG.turnos = newTurnos;
                    } else {
                        (updatedG as any)[field] = val;
                    }
                    return updatedG;
                })
            };
        }));
        setDirtyRows(prev => new Set(prev).add(`${escName}-${gestorName}`));
    };

    const calculateTotalHours = (turnos: string[]) => {
        let total = 0;
        turnos.forEach(t => {
            const v = (t || '').toUpperCase();
            if (v.includes('6 AM') || v.includes('12 PM')) {
                total += 7;
            } else if (v.includes('CICLOVÍA')) {
                total += 8;
            }
        });
        return total;
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
                        fecha_inicio: '2000-01-01' // Fecha fija para compatibilidad
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
            fecha_inicio: '2000-01-01'
        };
        try {
            await api.post('/horarios', { entries: [entry] });
            alert("Gestor registrado.");
            setShowAddForm(false);
            setNewGestor({ nombre: '', contacto: '', escenario: '' });
            loadData();
        } catch (err: any) { alert("Error al registrar: " + (err.response?.data?.error || err.message)); }
    };

    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rawData: any[] = XLSX.utils.sheet_to_json(ws);

                if (rawData.length === 0) return alert("El archivo está vacío");

                const mappedData = rawData.map(row => ({
                    escenario: (row.escenario || '').toString().trim(),
                    gestor_nombre: (row.funcionario || '').toString().toUpperCase().trim(),
                    contacto: (row.contacto || '').toString().trim(),
                    turnos: ["", "", "", "", "", "", ""],
                    fecha_inicio: '2000-01-01'
                })).filter(r => r.gestor_nombre && r.escenario);

                if (mappedData.length === 0) return alert("No se encontraron datos válidos con las columnas 'funcionario', 'contacto' y 'escenario'");

                if (!window.confirm(`¿Deseas importar ${mappedData.length} gestores?`)) return;

                await api.post('/horarios', { entries: mappedData });
                alert("Importación completada con éxito");
                loadData();
            } catch (err: any) {
                console.error("Error importando Excel:", err);
                alert("Error al procesar el archivo Excel: " + err.message);
            }
        };
        reader.readAsBinaryString(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
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

        const baseShift = activeGap.shift === 'MAÑANA' ? '6 AM – 1 PM' : '12 PM – 7 PM';
        const newTurnos = [...sourceEntry.turnos];
        const currentVal = (newTurnos[activeGap.day] || '');
        newTurnos[activeGap.day] = currentVal.toUpperCase().includes(baseShift)
            ? `${currentVal} ${activeGap.escenario.toUpperCase()}+`
            : `${baseShift} ${activeGap.escenario.toUpperCase()}+`;

        const payload = { ...sourceEntry, gestor_nombre: sourceEntry.nombre, turnos: newTurnos, fecha_inicio: '2000-01-01', escenario_id: sourceEntry.escId, escenario: sourceEntry.escName };
        try {
            await api.post('/horarios', { entries: [payload] });
            alert(`Sustitución consolidada en ${gestor.nombre}`);
            setShowReplacementModal(false);
            setActiveGap(null);
            loadData();
        } catch (err: any) { alert("Error: " + (err.response?.data?.error || err.message)); }
    };

    const handleExportExcel = () => {
        if (!filteredData || filteredData.length === 0) return alert("No hay datos para exportar");
        exportToExcel(filteredData, "Completo");
    };

    const getTurnoStyle = (t: string) => {
        const v = (t || '').toUpperCase();
        if (!v) return 'bg-white text-slate-300';
        if (v.includes('DES')) return 'bg-rose-50 text-rose-700 border-rose-200';
        if (v.includes('INC')) return 'bg-amber-50 text-amber-700 border-amber-200';
        if (v.includes('VAC')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        return (v.includes('6 AM') || v.includes('12 PM') || v.includes('CICLOVÍA'))
            ? 'bg-white text-black border-slate-200'
            : 'bg-blue-50 text-blue-800 border-blue-200 shadow-sm';
    };

    return (
        <div className="h-screen flex flex-col bg-slate-100 overflow-hidden text-black font-medium">
            <header className="h-[52px] bg-white border-b border-slate-200 px-4 flex items-center justify-between z-50">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-slate-100 rounded transition-all text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200">
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Gestión de Horarios</h1>
                </div>

                <div className="flex items-center gap-3">
                    {emptyCount > 0 && (
                        <button
                            onClick={() => setFilterEmpty(!filterEmpty)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-md font-bold text-[10px] uppercase transition-all ${filterEmpty ? 'bg-orange-600 text-white shadow-sm' : 'bg-red-50 text-red-600 border border-red-100'}`}
                        >
                            <AlertTriangle size={12} /> {emptyCount} VACANTES
                        </button>
                    )}

                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-md border border-slate-200">
                        <div className="relative flex items-center bg-white rounded border border-slate-200 px-2 py-0.5">
                            <Search className="text-slate-300" size={12} />
                            <input type="text" placeholder="Buscar funcionario..." className="bg-transparent border-none text-[10px] font-bold w-40 outline-none ml-2 text-slate-800" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <select className="bg-white border border-slate-200 rounded text-[10px] font-bold px-2 py-0.5 outline-none text-slate-600 cursor-pointer hover:bg-slate-50" value={selectedEscenario} onChange={e => setSelectedEscenario(e.target.value)}>
                            <option value="Todos">Todas las Sedes</option>
                            <option value="Ciclovía">Ciclovía</option>
                            {allowedEscenarios.filter(e => e !== 'Ciclovía').map(esc => <option key={esc} value={esc}>{esc}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setShowEscenariosModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-bold text-[10px] uppercase hover:bg-white transition-all shadow-sm">
                        <Layout size={14} className="text-indigo-600" /> Sedes
                    </button>

                    <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx,.xls" className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-md font-bold text-[10px] uppercase hover:bg-slate-50 transition-all shadow-sm">
                        <Upload size={14} className="text-blue-600" /> Importar
                    </button>

                    <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-md font-bold text-[10px] uppercase hover:bg-slate-50 transition-all shadow-sm">
                        <FileDown size={14} className="text-emerald-600" /> Excel
                    </button>

                    <button onClick={() => setShowAddForm(!showAddForm)} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md font-bold text-[10px] uppercase transition-all shadow-sm ${showAddForm ? 'bg-rose-600 text-white border-rose-700' : 'bg-slate-800 text-white border-slate-900 hover:bg-slate-900'}`}>
                        {showAddForm ? <X size={14} /> : <UserPlus size={14} />} {showAddForm ? 'Cerrar' : 'Nuevo'}
                    </button>

                    {isEditMode ? (
                        <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md font-bold text-[10px] uppercase shadow-md animate-pulse">
                            <Save size={14} /> Guardar
                        </button>
                    ) : (
                        <button onClick={() => setIsEditMode(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md font-bold text-[10px] uppercase hover:bg-white transition-all">
                            <Edit2 size={14} className="text-blue-600" /> Editar
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-hidden p-3 flex flex-col">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 mb-3 rounded-lg text-xs font-bold flex justify-between items-center shadow-sm">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}><X size={14} /></button>
                    </div>
                )}

                {showAddForm && (
                    <div className="bg-white p-4 mb-3 rounded-xl border border-slate-200 shadow-md animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-1">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nombre del Funcionario</label>
                                <input
                                    type="text"
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-xs outline-none focus:border-blue-500 transition-all text-slate-900"
                                    value={newGestor.nombre}
                                    onChange={e => setNewGestor({ ...newGestor, nombre: e.target.value.toUpperCase() })}
                                    placeholder="EJ: JUAN PÉREZ"
                                />
                            </div>
                            <div className="w-48 space-y-1">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contacto</label>
                                <input
                                    type="text"
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-xs outline-none focus:border-blue-500 transition-all text-slate-900"
                                    value={newGestor.contacto}
                                    onChange={e => setNewGestor({ ...newGestor, contacto: e.target.value })}
                                    placeholder="300..."
                                />
                            </div>
                            <div className="w-48 space-y-1">
                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sede Asignada</label>
                                <select
                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-[11px] outline-none focus:border-blue-500 cursor-pointer text-slate-900"
                                    value={newGestor.escenario}
                                    onChange={e => setNewGestor({ ...newGestor, escenario: e.target.value })}
                                >
                                    <option value="">SELECCIONE...</option>
                                    {allowedEscenarios.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={handleAdd}
                                className="mt-5 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold uppercase text-[10px] hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                            >
                                Registrar
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-auto h-full no-scrollbar">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Sincronizando Base de Datos...</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse table-fixed min-w-[1500px]">
                            <thead className="sticky top-0 z-40">
                                <tr className="bg-slate-900 text-white">
                                    <th className="w-[180px] p-3 text-[10px] font-bold uppercase text-left sticky left-0 bg-slate-900 z-50">Sede</th>
                                    <th className="w-[180px] p-3 text-[10px] font-bold uppercase text-left sticky left-[180px] bg-slate-900 z-50 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">Funcionario</th>
                                    <th className="w-[70px] p-3 text-[10px] font-bold uppercase text-center bg-indigo-900">Total</th>
                                    <th className="w-[110px] p-3 text-[10px] font-bold uppercase text-center">Contacto</th>
                                    {visibleDaysIdx.map(i => <th key={DAYS[i]} className="p-3 text-[10px] font-bold uppercase text-center">{DAYS[i]}</th>)}
                                    {isEditMode && <th className="w-[70px] bg-red-900/50 text-[10px] font-bold text-center uppercase">Acción</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.map((item, escIdx) => (
                                    <React.Fragment key={item.escenario}>
                                        {/* Separador de Escenario Azul Tenue */}
                                        <tr className="bg-blue-50/60 border-y border-blue-100">
                                            <td colSpan={visibleDaysIdx.length + (isEditMode ? 5 : 4)} className="px-4 py-2 sticky left-0 z-20">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                                                    <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider">{item.escenario}</span>
                                                    <span className="text-[9px] font-bold text-blue-400/80 uppercase ml-auto">Sectorizado</span>
                                                </div>
                                            </td>
                                        </tr>

                                        {item.gestores.length > 0 ? (
                                            item.gestores.map((g, gIdx) => (
                                                <tr key={`${item.escenario}-${g.nombre}`} className="bg-white transition-all hover:bg-slate-50 group">
                                                    <td className="p-3 sticky left-0 bg-white z-20 font-bold text-[10px] uppercase text-slate-400 border-r border-slate-50">{item.escenario}</td>
                                                    <td className="p-3 sticky left-[180px] bg-white z-20 font-bold text-[11px] uppercase text-slate-900 border-r border-slate-50 shadow-[1px_0_3px_rgba(0,0,0,0.05)]">{g.nombre}</td>
                                                    <td className="p-2 border-r border-slate-50 text-center bg-indigo-50/30">
                                                        <span className="text-[12px] font-black text-indigo-700">{calculateTotalHours(g.turnos)}h</span>
                                                    </td>
                                                    <td className="p-2 border-r border-slate-50 text-center">
                                                        {isEditMode ? (
                                                            <input type="text" className="w-full p-1.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-center text-slate-800 outline-none" value={g.contacto} onChange={e => handleUpdate(item.escenario, g.nombre, 'contacto', e.target.value)} />
                                                        ) : (
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <Phone size={11} className="text-slate-400" />
                                                                <span className="text-[10px] font-bold text-slate-600">{g.contacto || '---'}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    {visibleDaysIdx.map(tIdx => {
                                                        const t = g.turnos[tIdx];
                                                        return (
                                                            <td key={tIdx} className="p-1.5 border-r border-slate-50 align-middle">
                                                                {isEditMode ? (
                                                                    <div className="flex flex-col gap-1">
                                                                        <select className="w-full p-1 bg-white border border-slate-200 rounded text-[9px] font-bold text-center" value={TURNO_PRESETS.includes(t) ? t : "custom"} onChange={e => {
                                                                            if (e.target.value !== "custom") handleUpdate(item.escenario, g.nombre, 'turnos', e.target.value, tIdx);
                                                                        }}>
                                                                            <option value="custom">✍️ EDITAR</option>
                                                                            {TURNO_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                                                                        </select>
                                                                        <input type="text" className="w-full p-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-center uppercase" value={t} onChange={e => handleUpdate(item.escenario, g.nombre, 'turnos', e.target.value, tIdx)} />
                                                                    </div>
                                                                ) : (
                                                                    <div className={`mx-auto p-2 rounded border text-[10px] font-bold text-center leading-none min-w-[95px] shadow-sm uppercase ${getTurnoStyle(t)}`}>
                                                                        {t || '---'}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    {isEditMode && (
                                                        <td className="text-center p-2 bg-red-50/30">
                                                            <button onClick={() => handleDelete(item.escenario, g.nombre)} className="p-1.5 text-red-400 hover:text-red-600 transition-all hover:bg-white rounded border border-transparent hover:border-red-100">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        ) : item.gaps.length > 0 ? (
                                            <tr className="bg-white">
                                                <td className="p-3 sticky left-0 bg-white z-20 font-bold text-[10px] uppercase text-slate-300 border-r border-slate-50">{item.escenario}</td>
                                                <td className="p-3 sticky left-[180px] bg-white z-20 font-bold text-[10px] uppercase text-slate-300 border-r border-slate-50">---</td>
                                                <td colSpan={visibleDaysIdx.length + (isEditMode ? 3 : 2)} className="p-3 text-center">
                                                    <div className="flex items-center justify-center gap-2 py-1 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                                        <AlertCircle className="text-slate-300" size={16} />
                                                        <span className="text-slate-400 font-bold uppercase text-[10px] italic tracking-widest">Sede sin personal asignado</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : null}

                                        {/* Alertas de Cobertura */}
                                        {item.gaps.length > 0 && (
                                            <tr className="bg-white border-t border-slate-100">
                                                <td className="p-3 sticky left-0 bg-white z-20 border-r-2 border-red-400 font-bold text-[10px] text-red-500 uppercase italic">⚠️ Alerta</td>
                                                <td className="p-3 sticky left-[180px] bg-white z-20 font-bold text-[10px] text-slate-400 uppercase border-r border-slate-50">Sin Cobertura:</td>
                                                <td className="border-r border-slate-50 bg-indigo-50/10"></td>
                                                <td className="border-r border-slate-50"></td>
                                                {visibleDaysIdx.map(i => {
                                                    const dayGaps = item.gaps.filter(g => g.day === i);
                                                    return (
                                                        <td key={i} className="p-2 border-r border-slate-50">
                                                            {dayGaps.length > 0 && (
                                                                <div className="flex flex-col gap-1">
                                                                    {dayGaps.map(g => (
                                                                        <button
                                                                            key={g.shift}
                                                                            onClick={() => {
                                                                                setActiveGap({ escenario: item.escenario, day: i, shift: g.shift });
                                                                                setShowReplacementModal(true);
                                                                            }}
                                                                            className="bg-red-500 text-white text-[9px] font-black py-1.5 px-2 rounded text-center uppercase hover:bg-slate-900 transition-all shadow-sm"
                                                                        >
                                                                            {g.shift}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                {isEditMode && <td className="bg-red-50/20"></td>}
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            <ReplacementModal isOpen={showReplacementModal} onClose={() => setShowReplacementModal(false)} activeGap={activeGap} data={data} onAssign={handleAssignReplacement} />
            <ManageEscenariosModal isOpen={showEscenariosModal} onClose={() => setShowEscenariosModal(false)} onUpdated={loadData} />
        </div>
    );
}

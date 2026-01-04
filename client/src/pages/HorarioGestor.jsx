import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, UserPlus, Trash2, Edit2, Save, ArrowLeft, RotateCcw, X, Shield, Phone, AlertTriangle, ChevronDown, ListFilter, AlertCircle, Sparkles } from 'lucide-react';
import api from '../api';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const TURNO_PRESETS = [
    "6:00 1:30",
    "2:30 10:00",
    "DESCANSO",
    "INCAPACITADA",
    "VACACIONES"
];

const RANDOM_NAMES = [
    "CARLOS ANDRES MESA", "DANIELA OSORIO", "JUAN CAMILO RUA", "STEVEN ARANGO",
    "VALENTINA ZULUAGA", "MATEO GIRALDO", "SANTIAGO DUQUE", "ELENA RESTREPO",
    "LUCIA HENAO", "RICARDO VARGAS", "MARIA JOSE CORREA", "ANDRES FELIPE TOBON"
];

const ALLOWED_ESCENARIOS = [
    "Cancha Santa Ana", "Cancha Samaria", "Placa Samaria", "Cancha San Fernando",
    "Placa Viviendas del Sur", "Cancha Viviendas del Sur", "Cancha Providencia",
    "Cancha Yarumito", "Cancha San José", "Cancha EVE (Enrique Vélez Escobar)",
    "Cancha María Bernal", "Cancha Parque del Artista", "Cancha Intermunicipal",
    "Placa 19 de Abril", "Placa Cubierta La Aldea", "Placa Deportiva La Hortensia",
    "Cancha Arenilla Hortensia", "Skatepark", "Cerro de las Luces",
    "Pista BMX", "Pista de Atletismo", "Coliseo Ditaires", "Canchas de Tenis de Campo",
    "Ciclovía"
];

const normalize = (str) => {
    if (!str) return "";
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\./g, "")
        .replace(/cancha|placa/g, "")
        .trim();
};

export default function HorarioGestor() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEscenario, setSelectedEscenario] = useState('Todos');
    const [filterEmpty, setFilterEmpty] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const [data, setData] = useState([]);
    const [dirtyRows, setDirtyRows] = useState(new Set());
    const [newGestor, setNewGestor] = useState({ nombre: '', contacto: '', escenario: ALLOWED_ESCENARIOS[0] });

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/horarios');
            const dbData = response.data;

            const structured = ALLOWED_ESCENARIOS.map(esc => {
                const normEsc = normalize(esc);
                const gestoresMatches = dbData.filter(d => {
                    const normDb = normalize(d.escenario);
                    return normDb && (normDb.includes(normEsc) || normEsc.includes(normDb));
                });

                return {
                    escenario: esc,
                    gestores: gestoresMatches.map(d => ({
                        id: d.id,
                        nombre: d.gestor_nombre,
                        contacto: d.contacto,
                        turnos: [d.lunes, d.martes, d.miercoles, d.jueves, d.viernes, d.sabado, d.domingo].map(t => t || "")
                    }))
                };
            });

            setData(structured);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const filteredData = useMemo(() => {
        return data.map(item => {
            const isCicloviaFilter = selectedEscenario === 'Ciclovía';
            const filteredG = item.gestores.filter(g => {
                const matchesName = g.nombre.toLowerCase().includes(searchTerm.toLowerCase());
                if (!matchesName) return false;
                if (isCicloviaFilter) {
                    const hasCicloviaTurn = g.turnos.some(t => t.toUpperCase().includes('CICLOVIA'));
                    const isCicloviaEsc = normalize(item.escenario) === 'ciclovia';
                    return hasCicloviaTurn || isCicloviaEsc;
                }
                return true;
            });

            if (selectedEscenario !== 'Todos' && !isCicloviaFilter && item.escenario !== selectedEscenario) return null;
            if (isCicloviaFilter && filteredG.length === 0) return null;
            if (filterEmpty && filteredG.length > 0) return null;

            return { ...item, gestores: filteredG };
        }).filter(Boolean);
    }, [data, searchTerm, selectedEscenario, filterEmpty]);

    const emptyCount = useMemo(() => data.filter(e => e.gestores.length === 0).length, [data]);

    const fillWithMockData = async () => {
        if (!window.confirm("¿Deseas rellenar los escenarios vacíos con datos aleatorios de prueba?")) return;

        setIsLoading(true);
        const mockEntries = [];
        data.forEach(esc => {
            if (esc.gestores.length === 0) {
                const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
                const randomContact = "3" + Math.floor(100000000 + Math.random() * 900000000);
                const randomTurnos = Array(7).fill("").map(() => {
                    return TURNO_PRESETS[Math.floor(Math.random() * 2)]; // Solo 6:00 o 2:30 para que parezca real
                });
                randomTurnos[Math.floor(Math.random() * 5)] = "DESCANSO"; // Un descanso aleatorio entre semana

                mockEntries.push({
                    escenario: esc.escenario,
                    gestor_nombre: `${randomName} (PRUEBA)`,
                    contacto: randomContact,
                    turnos: randomTurnos
                });
            }
        });

        if (mockEntries.length > 0) {
            try {
                await api.post('/horarios', { entries: mockEntries });
                await loadData();
            } catch (err) { alert("Error al generar mock data."); }
        }
        setIsLoading(false);
    };

    const handleUpdate = (escIdx, gIdx, field, val, dayIdx = null) => {
        const newData = [...data];
        const actualEscIdx = data.findIndex(e => e.escenario === data[escIdx].escenario);
        if (dayIdx !== null) {
            newData[actualEscIdx].gestores[gIdx].turnos[dayIdx] = val;
        } else {
            newData[actualEscIdx].gestores[gIdx][field] = val;
        }
        setData([...newData]);
        setDirtyRows(prev => new Set(prev).add(`${newData[actualEscIdx].escenario}-${newData[actualEscIdx].gestores[gIdx].nombre}`));
    };

    const handleSave = async () => {
        const toSave = [];
        data.forEach(esc => {
            esc.gestores.forEach(g => {
                if (dirtyRows.has(`${esc.escenario}-${g.nombre}`)) {
                    toSave.push({ escenario: esc.escenario, gestor_nombre: g.nombre, contacto: g.contacto, turnos: g.turnos });
                }
            });
        });
        if (toSave.length === 0) return setIsEditMode(false);
        try {
            await api.post('/horarios', { entries: toSave });
            setDirtyRows(new Set());
            setIsEditMode(false);
            alert("Cambios guardados con éxito.");
        } catch (err) { alert("Error al guardar."); }
    };

    const handleDelete = async (esc, nom) => {
        if (!window.confirm(`¿Seguro que quieres eliminar a ${nom}?`)) return;
        try {
            await api.delete(`/horarios/${encodeURIComponent(esc)}/${encodeURIComponent(nom)}`);
            loadData();
        } catch (e) { alert("Error al eliminar."); }
    };

    const handleAdd = () => {
        if (!newGestor.nombre) return alert("El nombre es obligatorio");
        const escIdx = data.findIndex(e => e.escenario === newGestor.escenario);
        const newData = [...data];
        newData[escIdx].gestores.push({
            nombre: newGestor.nombre.toUpperCase(),
            contacto: newGestor.contacto,
            turnos: ["", "", "", "", "", "", ""]
        });
        setData([...newData]);
        setDirtyRows(prev => new Set(prev).add(`${newGestor.escenario}-${newGestor.nombre.toUpperCase()}`));
        setShowAddModal(false);
        setIsEditMode(true);
        setNewGestor({ nombre: '', contacto: '', escenario: ALLOWED_ESCENARIOS[0] });
    };

    const getTurnoStyle = (t) => {
        const v = (t || '').toUpperCase();
        if (!v) return 'bg-white text-slate-300';
        if (v.includes('DESCANSO')) return 'bg-rose-50 text-rose-700 border-rose-200';
        if (v.includes('INCAPACITADA')) return 'bg-amber-50 text-amber-700 border-amber-200';
        const isBase = (v === '6:00 1:30' || v === '2:30 10:00' || v === '6:00-1:30' || v === '2:30-10:00');
        if (isBase) return 'bg-white text-black border-slate-200';
        return 'bg-blue-50 text-blue-800 border-blue-200 shadow-sm';
    };

    return (
        <div className="h-screen flex flex-col bg-slate-100 overflow-hidden text-black font-medium">
            {/* POWERFUL HEADER */}
            <header className="h-[80px] bg-white border-b-4 border-slate-300 px-6 flex items-center justify-between shadow-lg z-50">
                <div className="flex items-center gap-5">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-xl transition-all border-2 border-slate-200 shadow-sm"><ArrowLeft size={22} className="text-black" /></button>
                    <div>
                        <h1 className="text-2xl font-black text-black uppercase italic leading-none tracking-tighter">Personal Operativo</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {emptyCount > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fillWithMockData}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-black text-[11px] uppercase hover:bg-purple-700 transition-all shadow-lg active:scale-95"
                                title="Rellenar vacíos con datos aleatorios"
                            >
                                <Sparkles size={16} /> Autocompletar
                            </button>
                            <button
                                onClick={() => setFilterEmpty(!filterEmpty)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[11px] uppercase transition-all shadow-lg ${filterEmpty ? 'bg-orange-600 text-white' : 'bg-red-50 text-red-600 border-2 border-red-200'}`}
                            >
                                <AlertTriangle size={16} /> {emptyCount} VACANTES
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 bg-slate-200/50 p-1.5 rounded-2xl border-2 border-slate-300 shadow-inner">
                        <div className="relative flex items-center bg-white rounded-xl border border-slate-300 px-3 py-1.5 shadow-sm group focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                            <Search className="text-slate-500" size={18} />
                            <input type="text" placeholder="Buscar Gestor..." className="bg-transparent border-none text-[13px] font-black w-44 outline-none ml-2 text-black" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <select className="bg-white border border-slate-300 rounded-xl text-[13px] font-black px-4 py-2 outline-none text-black shadow-sm" value={selectedEscenario} onChange={e => setSelectedEscenario(e.target.value)}>
                            <option value="Todos">Todas las Sedes</option>
                            <option value="Ciclovía">Ciclovía (Domingos)</option>
                            {ALLOWED_ESCENARIOS.filter(e => e !== 'Ciclovía').map(esc => <option key={esc} value={esc}>{esc}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-2xl font-black text-[12px] uppercase hover:bg-blue-800 transition-all shadow-2xl active:scale-95">
                        <UserPlus size={20} /> Alta Nueva
                    </button>
                    {isEditMode ? (
                        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[12px] uppercase shadow-2xl active:scale-95">
                            <Save size={20} /> Guardar
                        </button>
                    ) : (
                        <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-black text-[12px] uppercase hover:bg-slate-900 transition-all shadow-2xl active:scale-95 border-b-4 border-blue-400">
                            <Edit2 size={20} className="text-blue-400" /> Gestionar
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 overflow-hidden p-3 flex flex-col">
                <div className="bg-white rounded-[2rem] border-[6px] border-slate-300 shadow-2xl overflow-auto h-full no-scrollbar relative">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-5">
                            <div className="w-14 h-14 border-[5px] border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                            <p className="font-black text-black uppercase tracking-[0.3em] text-sm animate-pulse">Sincronizando Horarios...</p>
                        </div>
                    ) : (
                        <table className="w-full border-collapse table-fixed min-w-[1900px]">
                            <thead className="sticky top-0 z-40">
                                <tr className="bg-slate-950">
                                    <th className="w-[180px] p-5 text-[12px] font-black text-slate-400 uppercase text-left sticky left-0 bg-slate-950 border-r-2 border-slate-800">Escenario</th>
                                    <th className="w-[200px] p-5 text-[12px] font-black text-slate-400 uppercase text-left border-r-2 border-slate-800">Gestor</th>
                                    <th className="w-[130px] p-5 text-[12px] font-black text-slate-400 uppercase text-center border-r-2 border-slate-800">Tel</th>
                                    {DAYS.map(d => <th key={d} className="p-5 text-[12px] font-black text-slate-400 uppercase text-center border-r border-slate-800">{d}</th>)}
                                    {isEditMode && <th className="w-[80px] bg-red-950 border-l border-slate-800"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200">
                                {filteredData.map((item, escIdx) => (
                                    <React.Fragment key={item.escenario}>
                                        {item.gestores.length > 0 ? (
                                            item.gestores.map((g, gIdx) => {
                                                const isEven = escIdx % 2 === 0;
                                                const bg = isEven ? 'bg-white' : 'bg-[#7AA0E1]';
                                                const border = isEven ? 'border-slate-300' : 'border-[#6c91cf]';

                                                return (
                                                    <tr key={`${item.escenario}-${g.nombre}`} className={`${bg} transition-all hover:bg-blue-200/50 group`}>
                                                        {gIdx === 0 && (
                                                            <td rowSpan={item.gestores.length} className={`p-5 sticky left-0 ${bg} z-30 border-r-4 ${isEven ? 'border-slate-400' : 'border-blue-700'} shadow-lg font-black text-[14px] uppercase text-black align-middle leading-tight`}>
                                                                {item.escenario}
                                                            </td>
                                                        )}
                                                        <td className={`p-5 border-r-2 ${border} font-black text-[14px] uppercase text-black`}>
                                                            {g.nombre}
                                                        </td>
                                                        <td className={`p-3 border-r-2 ${border} text-center`}>
                                                            {isEditMode ? (
                                                                <input type="text" className="w-full p-2 bg-white/40 border-2 border-black/10 rounded-xl text-xs font-black text-center text-black outline-none focus:bg-white" value={g.contacto} onChange={e => handleUpdate(data.findIndex(d => d.escenario === item.escenario), gIdx, 'contacto', e.target.value)} />
                                                            ) : (
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <Phone size={14} className="text-black/60" />
                                                                    <span className="text-[14px] font-black text-black">{g.contacto || '---'}</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        {g.turnos.map((t, tIdx) => (
                                                            <td key={tIdx} className={`p-2 border-r ${border} align-middle`}>
                                                                {isEditMode ? (
                                                                    <div className="flex flex-col gap-1">
                                                                        <select
                                                                            className="w-full p-2 bg-white border-2 border-slate-200 rounded-xl text-[12px] font-black text-center text-black shadow-inner"
                                                                            value={TURNO_PRESETS.includes(t) ? t : "custom"}
                                                                            onChange={e => {
                                                                                if (e.target.value !== "custom") {
                                                                                    handleUpdate(data.findIndex(d => d.escenario === item.escenario), gIdx, 'turnos', e.target.value, tIdx);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <option value="custom">✍️ Manual</option>
                                                                            {TURNO_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                                                                        </select>
                                                                        <input
                                                                            type="text"
                                                                            className="w-full p-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-[12px] font-black text-center text-black outline-none focus:ring-2 focus:ring-blue-500"
                                                                            value={t}
                                                                            onChange={e => handleUpdate(data.findIndex(d => d.escenario === item.escenario), gIdx, 'turnos', e.target.value, tIdx)}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className={`p-4 rounded-3xl border-2 text-[13px] font-black text-center min-w-[155px] shadow-sm transform transition-all group-hover:scale-105 ${getTurnoStyle(t)}`}>
                                                                        {t || '---'}
                                                                    </div>
                                                                )}
                                                            </td>
                                                        ))}
                                                        {isEditMode && (
                                                            <td className="text-center p-3 bg-red-600/10">
                                                                <button onClick={() => handleDelete(item.escenario, g.nombre)} className="p-2 text-red-600 hover:scale-125 transition-all">
                                                                    <Trash2 size={24} />
                                                                </button>
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr className={escIdx % 2 === 0 ? 'bg-white' : 'bg-[#7AA0E1]'}>
                                                <td className={`p-5 sticky left-0 bg-inherit z-30 border-r-4 ${escIdx % 2 === 0 ? 'border-slate-400' : 'border-blue-700'} shadow-lg font-black text-[14px] uppercase text-black/40`}>{item.escenario}</td>
                                                <td colSpan={DAYS.length + 3} className="p-5 text-center">
                                                    <div className="flex items-center justify-center gap-4 py-4">
                                                        <AlertCircle className="text-red-600/50" size={24} />
                                                        <span className="text-black/30 font-black uppercase text-base tracking-[0.2em] italic">ESPACIO VACANTE - ASIGNACIÓN PENDIENTE</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* HIGH-PRECISION MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] shadow-[0_0_100px_rgba(30,58,138,0.3)] w-full max-w-lg overflow-hidden border-[8px] border-slate-200 animate-in zoom-in-90 duration-300">
                        <div className="p-8 border-b-4 border-slate-100 flex justify-between items-center bg-black">
                            <h2 className="text-white font-black uppercase text-base flex items-center gap-4 tracking-widest">
                                <Shield className="text-blue-500" size={28} />
                                Alta en el Sistema
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="text-white/30 hover:text-white transition-all bg-white/10 p-3 rounded-full"><X size={24} /></button>
                        </div>
                        <div className="p-12 space-y-8">
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-black uppercase tracking-widest ml-2">Nombre del Funcionario</label>
                                <input type="text" className="w-full p-5 bg-slate-50 border-4 border-slate-100 rounded-[2rem] font-black text-lg outline-none focus:border-blue-600 transition-all placeholder:text-slate-200 shadow-inner" value={newGestor.nombre} onChange={e => setNewGestor({ ...newGestor, nombre: e.target.value.toUpperCase() })} placeholder="EDWARD SNOWDEN..." />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-black uppercase tracking-widest ml-2">Contacto</label>
                                    <input type="text" className="w-full p-5 bg-slate-50 border-4 border-slate-100 rounded-[2rem] font-black text-lg outline-none focus:border-blue-600 transition-all shadow-inner" value={newGestor.contacto} onChange={e => setNewGestor({ ...newGestor, contacto: e.target.value })} placeholder="3XX..." />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-black uppercase tracking-widest ml-2">Ubicación</label>
                                    <select className="w-full p-5 bg-slate-50 border-4 border-slate-100 rounded-[2rem] font-black text-sm outline-none focus:border-blue-600 transition-all text-black shadow-inner" value={newGestor.escenario} onChange={e => setNewGestor({ ...newGestor, escenario: e.target.value })}>
                                        {ALLOWED_ESCENARIOS.map(e => <option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleAdd} className="w-full bg-blue-700 text-white py-6 rounded-[2.5rem] font-black uppercase text-lg shadow-[0_20px_50px_rgba(29,78,216,0.3)] hover:bg-blue-800 transition-all active:scale-95 flex items-center justify-center gap-4 mt-6">
                                <Sparkles size={24} /> Registrar Funcionario
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Eye, MapPin, Download } from 'lucide-react';
import api from '../api';

interface Novedad {
    id: number;
    tipo: string;
    descripcion: string;
    escenario_nombre: string;
    archivo_url: string | null;
    created_at: string;
}

export default function NovedadesView() {
    const navigate = useNavigate();
    const [novedades, setNovedades] = useState<Novedad[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNovedades = async () => {
            try {
                const res = await api.get('/novedades');
                setNovedades(res.data);
            } catch (err) {
                console.error("Error al cargar novedades:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNovedades();
    }, []);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-medium text-slate-800">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/subgerencia-escenarios')}
                        className="p-2 bg-white hover:bg-slate-50 text-slate-900 rounded-xl shadow-sm border border-slate-200 transition-all active:scale-95"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-black uppercase italic tracking-tighter leading-none">Historial de Novedades</h1>
                        <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Reportes de Infraestructura y Gestión</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Cargando reportes...</p>
                    </div>
                ) : novedades.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                        <FileText size={40} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-sm font-bold text-slate-400 uppercase">No hay reportes registrados aún</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {novedades.map((n) => (
                            <div key={n.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md">
                                {/* Media Preview */}
                                {n.archivo_url ? (
                                    <div className="h-44 bg-slate-100 relative">
                                        {n.archivo_url.match(/\.(mp4|mov|avi)$/i) ? (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white gap-2">
                                                <Download size={24} className="text-blue-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Video Adjunto</span>
                                            </div>
                                        ) : (
                                            <img
                                                src={n.archivo_url}
                                                alt="Evidencia"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <a
                                                href={n.archivo_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-white/90 backdrop-blur p-1.5 rounded-lg text-slate-900 shadow-sm hover:bg-black hover:text-white transition-all inline-block border border-slate-200"
                                            >
                                                <Eye size={16} />
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-44 bg-slate-50 flex flex-col items-center justify-center border-b border-slate-100">
                                        <FileText size={32} className="text-slate-200" />
                                        <span className="text-[9px] font-bold text-slate-300 uppercase mt-2">Sin evidencia visual</span>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${n.tipo === 'Mantenimiento Requerido' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                            n.tipo === 'Daño de infraestructura' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}>
                                            {n.tipo}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase ml-auto flex items-center gap-1">
                                            <Calendar size={10} /> {formatDate(n.created_at)}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-md text-slate-900 uppercase leading-tight mb-2 flex items-start gap-1.5">
                                        <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                        {n.escenario_nombre}
                                    </h3>

                                    <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-4 italic">
                                        "{n.descripcion}"
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                            ID
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest leading-none">Referencia</p>
                                            <p className="text-xs font-bold text-slate-700">Sistema: #{n.id}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

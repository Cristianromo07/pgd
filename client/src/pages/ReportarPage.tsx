import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';
import ReportNewsForm from '../components/ReportNewsForm';
import api from '../api';

export default function ReportarPage() {
    const navigate = useNavigate();
    const [scenarios, setScenarios] = useState([]);

    useEffect(() => {
        api.get('/escenarios').then(res => setScenarios(res.data));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-medium text-slate-800">
            <header className="h-[52px] bg-white border-b border-slate-200 px-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/subgerencia-escenarios')}
                        className="p-1 hover:bg-slate-100 rounded transition-all border border-transparent hover:border-slate-200"
                    >
                        <ArrowLeft size={16} className="text-slate-500" />
                    </button>
                    <h1 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Reportar Novedad</h1>
                </div>

                <button
                    onClick={() => navigate('/subgerencia-escenarios/novedades')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-white rounded-md font-bold text-[9px] uppercase hover:bg-black transition-all shadow-sm"
                >
                    <History size={12} /> Historial
                </button>
            </header>

            <main className="p-4 max-w-2xl mx-auto">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-4">
                    <ReportNewsForm scenarios={scenarios} />
                </div>
            </main>
        </div>
    );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Shield, ArrowRight } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuth();
    if (!user) return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Cargando perfil...</p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl mx-auto font-medium text-slate-800">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 shadow-sm border border-blue-100">
                    <User size={32} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Mi Perfil</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Configuración de Usuario</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">Nombre Completo</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={(user as any).name || 'Usuario'}
                            disabled
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 opacity-80 cursor-not-allowed"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">Rol del Sistema</label>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                            <Shield size={12} className="text-blue-400" />
                            {(user as any).role || 'Desconocido'}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">Estado de Sesión</label>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-widest border border-emerald-100">
                        Sesión Activa
                    </span>
                </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => alert('Funcionalidad de editar próximamente')}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm"
                >
                    Editar Información
                </button>

                <Link
                    to="/subgerencia-escenarios/horario-gestor"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm shadow-blue-100"
                >
                    Ver Horarios <ArrowRight size={14} />
                </Link>
            </div>
        </div>
    );
}

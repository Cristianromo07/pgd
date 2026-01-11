import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Trophy, Heart, Map, Clock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
    const { user } = useAuth();
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 font-medium text-slate-800">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight leading-none">Bienvenido</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed max-w-md">
                    Selecciona el área de gestión para comenzar a trabajar en el sistema.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Rutas Administrativas */}
                {(user as any)?.role === 'admin' && (
                    <>
                        <DashboardCard
                            to="/cultura"
                            icon={<Palette className="h-8 w-8 text-purple-600" />}
                            title="Cultura"
                            desc="Gestión cultural y artística Itagüí."
                        />
                        <DashboardCard
                            to="/fomento-deportivo"
                            icon={<Trophy className="h-8 w-8 text-amber-500" />}
                            title="Fomento Deportivo"
                            desc="Programas de apoyo y formación."
                        />
                        <DashboardCard
                            to="/actividad-fisica"
                            icon={<Heart className="h-8 w-8 text-rose-500" />}
                            title="Actividad Física"
                            desc="Promoción de hábitos saludables."
                        />
                    </>
                )}

                {/* Rutas Comunes */}
                <DashboardCard
                    to="/subgerencia-escenarios"
                    icon={<Map className="h-8 w-8 text-emerald-600" />}
                    title="Escenarios"
                    desc="Explorar y gestionar escenarios."
                />

                <DashboardCard
                    to="/subgerencia-escenarios/horario-gestor"
                    icon={<Clock className="h-8 w-8 text-blue-600" />}
                    title="Horarios"
                    desc="Planificación semanal gestores."
                />

                <DashboardCard
                    to="/profile"
                    icon={<User className="h-8 w-8 text-slate-500" />}
                    title="Mi Perfil"
                    desc="Datos personales y ajustes."
                />
            </div>
        </div>
    );
}

interface DashboardCardProps {
    to: string;
    icon: React.ReactNode;
    title: string;
    desc: string;
}

function DashboardCard({ to, icon, title, desc }: DashboardCardProps) {
    return (
        <Link to={to} className="block p-6 bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 group text-center border-b-4 border-b-slate-200 hover:border-b-blue-400">
            <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:border-blue-100 transition-colors">
                    {icon}
                </div>
            </div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight mb-2">{title}</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">{desc}</p>
        </Link>
    );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Trophy, Heart, Map, Clock, User } from 'lucide-react';

export default function DashboardPage({ user }) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold mb-2">Bienvenido</h1>
            <p className="text-gray-600 mb-6">
                Has iniciado sesión correctamente. Selecciona el área de tu interés o gestión.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Rutas Administrativas */}
                {user.role === 'admin' && (
                    <>
                        <DashboardCard
                            to="/cultura"
                            icon={<Palette className="h-10 w-10 text-purple-500" />}
                            title="Cultura"
                            desc="Gestión cultural y artística."
                        />
                        <DashboardCard
                            to="/fomento-deportivo"
                            icon={<Trophy className="h-10 w-10 text-yellow-500" />}
                            title="Fomento Deportivo"
                            desc="Programas de apoyo al deporte."
                        />
                        <DashboardCard
                            to="/actividad-fisica"
                            icon={<Heart className="h-10 w-10 text-red-500" />}
                            title="Actividad Física"
                            desc="Promoción de hábitos saludables."
                        />
                    </>
                )}

                {/* Rutas Comunes */}
                <DashboardCard
                    to="/subgerencia-escenarios"
                    icon={<Map className="h-10 w-10 text-green-500" />}
                    title="Subgerencia Escenarios"
                    desc="Gestión y reporte de novedades."
                />

                <DashboardCard
                    to="/subgerencia-escenarios/horario-gestor"
                    icon={<Clock className="h-10 w-10 text-blue-500" />}
                    title="Horario Gestor"
                    desc="Gestiona horarios semanales."
                />

                <DashboardCard
                    to="/profile"
                    icon={<User className="h-10 w-10 text-slate-500" />}
                    title="Mi Perfil"
                    desc="Actualiza tus datos y preferencias."
                />
            </div>
        </div>
    );
}

function DashboardCard({ to, icon, title, desc }) {
    return (
        <Link to={to} className="block p-6 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30 transition-all text-center group">
            <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
        </Link>
    );
}

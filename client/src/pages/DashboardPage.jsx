import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPage({ user }) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold mb-2">Bienvenido 👋</h1>
            <p className="text-gray-600 mb-6">
                Has iniciado sesión correctamente. Selecciona el área de tu interés o gestión.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Rutas Administrativas */}
                {user.role === 'admin' && (
                    <>
                        <DashboardCard
                            to="/cultura"
                            icon="🎭"
                            title="Cultura"
                            desc="Gestión cultural y artística."
                        />
                        <DashboardCard
                            to="/fomento-deportivo"
                            icon="🏆"
                            title="Fomento Deportivo"
                            desc="Programas de apoyo al deporte."
                        />
                        <DashboardCard
                            to="/actividad-fisica"
                            icon="🏃‍♀️"
                            title="Actividad Física"
                            desc="Promoción de hábitos saludables."
                        />
                    </>
                )}

                {/* Rutas Comunes */}
                <DashboardCard
                    to="/subgerencia-escenarios"
                    icon="🏟️"
                    title="Subgerencia Escenarios"
                    desc="Gestión y reporte de novedades."
                />

                <DashboardCard
                    to="/subgerencia-escenarios/horario-gestor"
                    icon="📅"
                    title="Horario Gestor"
                    desc="Gestiona horarios semanales."
                />

                <DashboardCard
                    to="/profile"
                    icon="👤"
                    title="Mi Perfil"
                    desc="Actualiza tus datos y preferencias."
                />
            </div>
        </div>
    );
}

function DashboardCard({ to, icon, title, desc }) {
    return (
        <Link to={to} className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:bg-slate-50 transition-all text-center group">
            <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{icon}</span>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{desc}</p>
        </Link>
    );
}

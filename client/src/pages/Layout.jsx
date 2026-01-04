import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Layout({ user, setUser }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.get('/logout');
            setUser(null);
            navigate('/');
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        }
    };

    const isAdmin = user?.role === 'admin';

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col md:flex-row">
            {/* Sidebar / Navbar */}
            <aside className="bg-slate-800 text-white w-full md:w-64 p-4 flex flex-col">
                <div className="text-2xl font-bold mb-8 flex items-center gap-2">
                    Gestión Deportiva
                </div>

                <nav className="flex-1 space-y-2">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => `block px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                    >
                        Inicio
                    </NavLink>

                    {isAdmin && (
                        <>
                            <NavLink
                                to="/cultura"
                                className={({ isActive }) => `block px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                            >
                                Cultura
                            </NavLink>
                            <NavLink
                                to="/fomento-deportivo"
                                className={({ isActive }) => `block px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                            >
                                Fomento Deportivo
                            </NavLink>
                            <NavLink
                                to="/actividad-fisica"
                                className={({ isActive }) => `block px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                            >
                                Actividad Física
                            </NavLink>
                        </>
                    )}

                    <NavLink
                        to="/subgerencia-escenarios"
                        className={({ isActive }) => `block px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                    >
                        Escenarios
                    </NavLink>

                    <NavLink
                        to="/subgerencia-escenarios/horario-gestor"
                        className={({ isActive }) => `block px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                    >
                        Horario Gestor
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) => `block px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                    >
                        Mi Perfil
                    </NavLink>
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-auto bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 w-full text-center"
                >
                    Cerrar Sesión
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}

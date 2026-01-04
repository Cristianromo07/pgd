import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../api';
import { Home, Palette, Trophy, Heart, Map, Clock, User, LogOut, LayoutDashboard } from 'lucide-react';

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
                    <LayoutDashboard className="h-8 w-8 text-blue-500" />
                    <span className="tracking-tight">PGD Itagüí</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                    >
                        <Home className="h-5 w-5" />
                        <span>Inicio</span>
                    </NavLink>

                    {isAdmin && (
                        <>
                            <NavLink
                                to="/cultura"
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                            >
                                <Palette className="h-5 w-5" />
                                <span>Cultura</span>
                            </NavLink>
                            <NavLink
                                to="/fomento-deportivo"
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                            >
                                <Trophy className="h-5 w-5" />
                                <span>Fomento Deportivo</span>
                            </NavLink>
                            <NavLink
                                to="/actividad-fisica"
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                            >
                                <Heart className="h-5 w-5" />
                                <span>Actividad Física</span>
                            </NavLink>
                        </>
                    )}

                    <NavLink
                        to="/subgerencia-escenarios"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                    >
                        <Map className="h-5 w-5" />
                        <span>Escenarios</span>
                    </NavLink>

                    <NavLink
                        to="/subgerencia-escenarios/horario-gestor"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                    >
                        <Clock className="h-5 w-5" />
                        <span>Horario Gestor</span>
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                    >
                        <User className="h-5 w-5" />
                        <span>Mi Perfil</span>
                    </NavLink>
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-auto bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white py-2 px-4 rounded transition-all w-full text-center flex items-center justify-center gap-2 border border-red-600/20"
                >
                    <LogOut className="h-5 w-5" />
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

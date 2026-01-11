import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Palette, Trophy, Heart, Map, Clock, User, LogOut, LayoutDashboard, FileText, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Error al cerrar sesión', error);
        }
    };

    const isAdmin = (user as any)?.role === 'admin';
    // Ocultar sidebar en todas las páginas de escenarios (calendario, horario, reportes)
    const isFullScreenPage = location.pathname.startsWith('/subgerencia-escenarios');

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col md:flex-row text-slate-800">
            {/* Sidebar / Navbar - Oculto en páginas de ESCENARIOS */}
            {!isFullScreenPage && (
                <aside className="bg-slate-900 text-white w-full md:w-64 p-4 flex flex-col border-r border-slate-800">
                    <div className="text-xl font-bold mb-8 flex items-center gap-2 px-2">
                        <div className="p-1.5 bg-blue-600 rounded-lg">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                        <span className="tracking-tight uppercase text-sm">PGD Itagüí</span>
                    </div>

                    <nav className="flex-1 space-y-1">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Home className="h-4 w-4" />
                            <span>Inicio</span>
                        </NavLink>

                        {isAdmin && (
                            <>
                                <NavLink
                                    to="/cultura"
                                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                >
                                    <Palette className="h-4 w-4" />
                                    <span>Cultura</span>
                                </NavLink>
                                <NavLink
                                    to="/fomento-deportivo"
                                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                >
                                    <Trophy className="h-4 w-4" />
                                    <span>Fomento Deportivo</span>
                                </NavLink>
                                <NavLink
                                    to="/actividad-fisica"
                                    className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                                >
                                    <Heart className="h-4 w-4" />
                                    <span>Actividad Física</span>
                                </NavLink>
                            </>
                        )}

                        <div className="pt-4 pb-2 px-3">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Escenarios</p>
                        </div>

                        <NavLink
                            to="/subgerencia-escenarios"
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Map className="h-4 w-4" />
                            <span>Explorar</span>
                        </NavLink>

                        <NavLink
                            to="/subgerencia-escenarios/horario-gestor"
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Clock className="h-4 w-4" />
                            <span>Horarios</span>
                        </NavLink>

                        <NavLink
                            to="/subgerencia-escenarios/reportar"
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <FileText className="h-4 w-4" />
                            <span>Reportar</span>
                        </NavLink>

                        <NavLink
                            to="/subgerencia-escenarios/novedades"
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <History className="h-4 w-4" />
                            <span>Historial</span>
                        </NavLink>

                        <div className="pt-4 pb-2 px-3">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Usuario</p>
                        </div>

                        <NavLink
                            to="/profile"
                            className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <User className="h-4 w-4" />
                            <span>Mi Perfil</span>
                        </NavLink>
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 hover:text-rose-500 border border-slate-800 hover:border-rose-500/20 shadow-sm"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar Sesión</span>
                    </button>
                </aside>
            )}

            {/* Área de Contenido Principal */}
            <main className={`flex-1 overflow-auto ${isFullScreenPage ? 'p-0 h-screen w-full' : 'p-4 md:p-8'}`}>
                <Outlet />
            </main>
        </div>
    );
}

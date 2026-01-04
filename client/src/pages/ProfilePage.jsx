import React from 'react';
import { Link } from 'react-router-dom';

export default function ProfilePage({ user }) {
    if (!user) return <div className="text-center p-8">Cargando perfil...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input
                        type="text"
                        value={user.name || 'Usuario'}
                        disabled
                        className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm opacity-75"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                    <input
                        type="text"
                        value={user.role || 'Desconocido'}
                        disabled
                        className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm opacity-75 uppercase"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Estado de Sesión</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                        Activa
                    </span>
                </div>
            </div>

            <div className="mt-8 flex gap-4">
                <button
                    onClick={() => alert('Funcionalidad de editar próximamente')}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                >
                    Editar Perfil
                </button>

                <Link
                    to="/subgerencia-escenarios/horario-gestor"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Ver Horario Gestor
                </Link>
            </div>
        </div>
    );
}

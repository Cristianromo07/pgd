import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import { Lock, Save, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    const handleReset = async (e) => {
        e.preventDefault();

        if (!token) {
            setMsg('Token de recuperación no encontrado');
            setError(true);
            return;
        }

        if (password !== confirmPassword) {
            setMsg('Las contraseñas no coinciden');
            setError(true);
            return;
        }

        setLoading(true);
        try {
            await api.post('/reset-password', { token, newPassword: password });
            setMsg('Contraseña restablecida con éxito. Redirigiendo al login...');
            setError(false);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            setMsg(err.response?.data?.error || 'Error al restablecer la contraseña');
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
                    <p className="mb-6">El enlace de recuperación es inválido o ha expirado.</p>
                    <Link to="/" className="text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">
                    Nueva Contraseña
                </h1>

                {msg && (
                    <div className={`px-4 py-3 rounded mb-4 text-sm border ${error ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`}>
                        {msg}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                className="block w-full pl-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                className="block w-full pl-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="********"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Restableciendo...' : (
                            <>
                                <Save className="h-5 w-5" />
                                Restablecer Contraseña
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

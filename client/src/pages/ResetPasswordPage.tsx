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

    const handleReset = async (e: React.FormEvent) => {
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
        } catch (err: any) {
            setMsg(err.response?.data?.error || 'Error al restablecer la contraseña');
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-medium">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md text-center">
                    <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
                    <h1 className="text-lg font-bold mb-2 text-rose-600 uppercase tracking-tight">Acceso Denegado</h1>
                    <p className="mb-8 text-xs text-slate-500 leading-relaxed uppercase font-bold tracking-wide">El enlace de recuperación es inválido o ha expirado por motivos de seguridad.</p>
                    <Link to="/" className="text-blue-600 hover:text-blue-700 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-medium text-slate-800">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md text-center">
                <div className="mb-8 text-center">
                    <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                        Nueva Contraseña
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Seguridad de la Cuenta</p>
                </div>

                {msg && (
                    <div className={`px-4 py-2.5 rounded-lg mb-6 text-xs font-bold uppercase tracking-wide border ${error ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                        {msg}
                    </div>
                )}

                <form onSubmit={handleReset} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest text-left">Nueva Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-slate-300" />
                            </div>
                            <input
                                type="password"
                                className="block w-full pl-10 pr-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest text-left">Confirmar Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-slate-300" />
                            </div>
                            <input
                                type="password"
                                className="block w-full pl-10 pr-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                        className="w-full bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-black transition-all shadow-sm font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 mt-2"
                    >
                        {loading ? (
                            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save className="h-3.5 w-3.5" />
                                Restablecer
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Mail, Send, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const res = await api.post('/forgot-password', { email });
            setMsg(res.data.message);
            setError(false);
        } catch (err: any) {
            setMsg(err.response?.data?.error || 'Error al procesar la solicitud');
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-medium text-slate-800">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md text-center">
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                        Recuperar Acceso
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recuperación de Contraseña</p>
                </div>

                {msg && (
                    <div className={`px-4 py-2.5 rounded-lg mb-6 text-xs font-bold uppercase tracking-wide border ${error ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                        {msg}
                    </div>
                )}

                <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                    Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña de forma segura.
                </p>

                <form onSubmit={handleRequest} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest text-left">Correo Electrónico</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-slate-300" />
                            </div>
                            <input
                                type="email"
                                className="block w-full pl-10 pr-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-black transition-all shadow-sm font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Send className="h-3.5 w-3.5" />
                                Enviar Enlace
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <Link to="/" className="text-blue-600 hover:text-blue-700 font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Mail, Lock, UserPlus } from 'lucide-react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMsg('Las contraseñas no coinciden');
            setError(true);
            return;
        }

        try {
            await api.post('/register', { email, password });
            setMsg('Usuario registrado correctamente. Redirigiendo al login...');
            setError(false);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setMsg(err.response?.data?.error || 'Error al registrar usuario');
            setError(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-medium text-slate-800">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
                        Crear Cuenta
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Regístrate en el Sistema</p>
                </div>

                {msg && (
                    <div className={`px-4 py-2.5 rounded-lg mb-6 text-xs font-bold uppercase tracking-wide border ${error ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                        {msg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">Correo Electrónico</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-slate-300" />
                            </div>
                            <input
                                type="email"
                                className="block w-full pl-10 pr-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-slate-300" />
                            </div>
                            <input
                                type="password"
                                className="block w-full pl-10 pr-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-widest">Confirmar Contraseña</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-slate-300" />
                            </div>
                            <input
                                type="password"
                                className="block w-full pl-10 pr-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white py-2 px-4 rounded-lg hover:bg-black transition-all shadow-sm font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 mt-2"
                    >
                        <UserPlus className="h-3.5 w-3.5" />
                        Registrarse
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/" className="text-blue-600 hover:text-blue-700 block mt-1">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

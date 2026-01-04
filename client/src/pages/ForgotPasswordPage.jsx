import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Mail, Send, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const res = await api.post('/forgot-password', { email });
            setMsg(res.data.message);
            setError(false);
        } catch (err) {
            setMsg(err.response?.data?.error || 'Error al procesar la solicitud');
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">
                    Recuperar Contraseña
                </h1>

                {msg && (
                    <div className={`px-4 py-3 rounded mb-4 text-sm border ${error ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`}>
                        {msg}
                    </div>
                )}

                <p className="text-sm text-gray-600 mb-6 text-center">
                    Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <form onSubmit={handleRequest} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                className="block w-full pl-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Enviando...' : (
                            <>
                                <Send className="h-5 w-5" />
                                Enviar Enlace
                            </>
                        )}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-xs text-gray-500">
                            ¿Tienes problemas? <a href="mailto:admin@test.com" className="text-blue-600 hover:underline">Contacta al administrador</a>
                        </p>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    <Link to="/" className="text-blue-600 hover:text-blue-500 font-medium flex items-center justify-center gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Volver al inicio de sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}

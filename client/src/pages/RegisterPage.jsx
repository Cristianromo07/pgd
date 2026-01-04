import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // El server debe devolver JSON para /register
            await api.post('/register', { email, password });
            setMsg('Usuario registrado correctamente. Redirigiendo al login...');
            setError(false);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err) {
            console.error(err);
            setMsg(err.response?.data || 'Error al registrar usuario');
            setError(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">
                    Registro
                </h1>

                {msg && (
                    <div className={`px-4 py-3 rounded mb-4 text-sm border ${error ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`}>
                        {msg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                        <input
                            type="email"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-semibold"
                    >
                        Registrarse
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/" className="text-blue-600 hover:text-blue-500 font-medium">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function LoginPage({ setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Nota: El servidor debe ser actualizado para responder JSON en /login
            const res = await api.post('/login', { email, password });

            if (res.status === 200) {
                // Asumimos que el backend nos devuelve el rol o info del usuario
                // O hacemos un fetch adicional a /user-info si es necesario
                // Por ahora forzamos una recarga o validación de sesión
                const userInfo = await api.get('/user-info');
                if (userInfo.data.loggedIn) {
                    setUser(userInfo.data);
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Credenciales incorrectas o error en el servidor');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">
                    Gestion Deportiva
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usuario</label>
                        <input
                            type="email"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="ejemplo@correo.com"
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
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-semibold"
                    >
                        Ingresar
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}

// App principal - Configuración de rutas
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

// Páginas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import Layout from './pages/Layout';
import SubgerenciaPage from './pages/SubgerenciaPage';
import HorarioGestor from './pages/HorarioGestor';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NovedadesView from './pages/NovedadesView';
import ReportarPage from './pages/ReportarPage';
import { CulturaPage, FomentoPage, ActividadFisicaPage } from './pages/GenericPages';

import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Rutas Protegidas (Layout) */}
        <Route element={user ? <Layout /> : <Navigate to="/" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/subgerencia-escenarios" element={<SubgerenciaPage />} />
          <Route path="/subgerencia-escenarios/reportar" element={<ReportarPage />} />
          <Route path="/subgerencia-escenarios/novedades" element={<NovedadesView />} />
          <Route path="/subgerencia-escenarios/horario-gestor/:date?" element={<HorarioGestor />} />
          <Route path="/cultura" element={<CulturaPage />} />
          <Route path="/fomento-deportivo" element={<FomentoPage />} />
          <Route path="/actividad-fisica" element={<ActividadFisicaPage />} />

          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Ruta por defecto (404) rederige al home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

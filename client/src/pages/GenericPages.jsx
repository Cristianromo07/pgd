import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Trophy, Heart, ArrowLeft } from 'lucide-react';

export default function GenericPage({ title, icon, description }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg">
                    {icon}
                </div>
                <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
            </div>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">{description}</p>

            <div className="border-t pt-6">
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}

export function CulturaPage() {
    return <GenericPage
        title="Cultura"
        icon={<Palette className="h-8 w-8 text-purple-500" />}
        description="Bienvenido al área de Cultura. Aquí encontrarás información sobre eventos culturales y artísticos, talleres y promoción del talento local."
    />;
}

export function FomentoPage() {
    return <GenericPage
        title="Fomento Deportivo"
        icon={<Trophy className="h-8 w-8 text-yellow-500" />}
        description="Programas de apoyo al deporte y formación de nuevos talentos. Gestionamos becas, patrocinios y eventos competitivos."
    />;
}

export function ActividadFisicaPage() {
    return <GenericPage
        title="Actividad Física"
        icon={<Heart className="h-8 w-8 text-red-500" />}
        description="Promoción de hábitos saludables y actividad física para toda la comunidad. Rutinas, parques activos e integración social."
    />;
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Trophy, Heart, ArrowLeft } from 'lucide-react';

interface GenericPageProps {
    title: string;
    icon: React.ReactNode;
    description: string;
}

export default function GenericPage({ title, icon, description }: GenericPageProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-3xl mx-auto font-medium text-slate-800">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-transform hover:scale-110">
                    {icon}
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{title}</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-none">Área de Gestión</p>
                </div>
            </div>

            <p className="text-sm text-slate-500 mb-10 leading-relaxed font-medium italic underline decoration-blue-100 decoration-4 underline-offset-4">
                "{description}"
            </p>

            <div className="border-t border-slate-100 pt-8 flex">
                <Link to="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-all font-bold text-[10px] uppercase tracking-widest border border-slate-200 shadow-sm">
                    <ArrowLeft size={14} />
                    Volver al Dashboard
                </Link>
            </div>
        </div>
    );
}

export function CulturaPage() {
    return <GenericPage
        title="Cultura"
        icon={<Palette className="h-8 w-8 text-purple-600" />}
        description="Bienvenido al área de Cultura. Aquí encontrarás información sobre eventos culturales y artísticos, talleres y promoción del talento local."
    />;
}

export function FomentoPage() {
    return <GenericPage
        title="Fomento Deportivo"
        icon={<Trophy className="h-8 w-8 text-amber-500" />}
        description="Programas de apoyo al deporte y formación de nuevos talentos. Gestionamos becas, patrocinios y eventos competitivos."
    />;
}

export function ActividadFisicaPage() {
    return <GenericPage
        title="Actividad Física"
        icon={<Heart className="h-8 w-8 text-rose-500" />}
        description="Promoción de hábitos saludables y actividad física para toda la comunidad. Rutinas, parques activos e integración social."
    />;
}

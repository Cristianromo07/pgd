import React, { useState } from 'react';
import api from '../api';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';

interface Scenario {
    id: number;
    nombre: string;
}

interface ReportNewsFormProps {
    scenarios: Scenario[];
}

export default function ReportNewsForm({ scenarios }: ReportNewsFormProps) {
    const [formData, setFormData] = useState({
        scenario: scenarios.length > 0 ? scenarios[0].nombre : '',
        scenario_id: scenarios.length > 0 ? scenarios[0].id : '',
        type: 'Mantenimiento Requerido',
        description: ''
    });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (e.target.name === 'scenario') {
            const selected = scenarios.find(s => s.nombre === e.target.value);
            setFormData({
                ...formData,
                scenario: e.target.value,
                scenario_id: selected ? selected.id : ''
            });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        if (selectedFile) {
            setFile(selectedFile);
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result as string);
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('scenario', formData.scenario);
        data.append('scenario_id', formData.scenario_id.toString());
        data.append('type', formData.type);
        data.append('description', formData.description);
        if (file) {
            data.append('archivo', file);
        }

        try {
            await api.post('/novedades', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Novedad registrada correctamente');
            setFormData(prev => ({ ...prev, description: '' }));
            setFile(null);
            setPreview(null);
        } catch (err: any) {
            console.error(err);
            alert('Error al registrar la novedad: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <FileText size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Reportar Novedad</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-none mt-1">Gestión Técnica</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="scenario" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Escenario:</label>
                    <select
                        id="scenario"
                        name="scenario"
                        value={formData.scenario}
                        onChange={handleChange}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-xs bg-slate-50 transition-all"
                    >
                        {scenarios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="type" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Categoría:</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-xs bg-slate-50 transition-all"
                    >
                        <option>Mantenimiento Requerido</option>
                        <option>Daño de infraestructura</option>
                        <option>Insumos faltantes</option>
                        <option>Otro</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="description" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Descripción:</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-xs bg-slate-50"
                        placeholder="Detalle la novedad..."
                        required
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Adjunto:</label>
                    <div className="flex items-center justify-center w-full">
                        <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                            <div className="flex flex-col items-center justify-center py-2">
                                {file ? (
                                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase">
                                        <CheckCircle size={14} />
                                        <span>{file.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5 mb-1.5 text-slate-300" />
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center px-4">Toca para adjuntar evidencia</p>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                        </label>
                    </div>

                    {preview && (
                        <div className="mt-2 relative group w-24 h-24 mx-auto">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
                            <button
                                onClick={() => { setFile(null); setPreview(null); }}
                                className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-2.5 rounded-lg font-bold uppercase text-[10px] tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${isSubmitting ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-slate-900 text-white hover:bg-black active:scale-95'}`}
                    >
                        {isSubmitting ? (
                            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Upload size={14} />
                                Enviar Reporte
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

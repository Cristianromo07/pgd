import React, { useState } from 'react';

export default function ReportNewsForm({ scenarios }) {
    const [formData, setFormData] = useState({
        scenario: scenarios.length > 0 ? scenarios[0].nombre : '',
        type: 'Mantenimiento Requerido',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulación por ahora, igual que en el HTML original
        alert(`Novedad registrada correctamente:\nEscenario: ${formData.scenario}\nTipo: ${formData.type}\nDescripción: ${formData.description}`);

        // Reset opcional
        setFormData(prev => ({ ...prev, description: '' }));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Reportar Novedad</h2>
            <p className="text-gray-600 mb-6">Gestión y reporte de novedades en los escenarios deportivos.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="scenario" className="block text-sm font-medium text-gray-700 mb-1">Escenario Deportivo:</label>
                    <select
                        id="scenario"
                        name="scenario"
                        value={formData.scenario}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        {scenarios.length > 0 ? (
                            scenarios.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)
                        ) : (
                            <>
                                <option>Cancha Multifuncional</option>
                                <option>Piscina Olímpica</option>
                                <option>Gimnasio al Aire Libre</option>
                                <option>Otro</option>
                            </>
                        )}
                    </select>
                </div>

                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Novedad:</label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option>Mantenimiento Requerido</option>
                        <option>Daño de infraestructura</option>
                        <option>Insumos faltantes</option>
                        <option>Otro</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción:</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Detalle la novedad aquí..."
                    ></textarea>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Registrar Novedad
                    </button>
                </div>
            </form>
        </div>
    );
}

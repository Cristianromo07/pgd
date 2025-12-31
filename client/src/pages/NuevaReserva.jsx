import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ReservaForm from '../components/ReservaForm';

export default function NuevaReserva() {
    const [escenarios, setEscenarios] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/escenarios')
            .then(res => setEscenarios(res.data));
    }, []);

    const handleSuccess = () => {
        navigate('/subgerencia-escenarios/horario-gestor');
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <ReservaForm escenarios={escenarios} onSuccess={handleSuccess} />
        </div>
    );
}

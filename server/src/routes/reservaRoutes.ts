import express from 'express';
import * as reservaController from '../controllers/reservaController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.get('/reservas', reservaController.getReservas);
router.post('/reservas', isAuthenticated, reservaController.createReserva);
router.put('/reservas/:id', isAuthenticated, reservaController.updateReserva);
router.delete('/reservas/:id', isAuthenticated, reservaController.deleteReserva);

export default router;

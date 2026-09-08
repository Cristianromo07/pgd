import express from 'express';
import * as escenarioController from '../controllers/escenarioController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Escenarios (sedes)
router.get('/escenarios', escenarioController.getEscenarios);
router.post('/escenarios', isAuthenticated, escenarioController.createEscenario);
router.put('/escenarios/:id', isAuthenticated, escenarioController.updateEscenario);
router.delete('/escenarios/:id', isAuthenticated, escenarioController.deleteEscenario);

// Espacios (canchas / sub-espacios reservables)
router.get('/espacios', escenarioController.getEspacios);
router.post('/espacios', isAuthenticated, escenarioController.createEspacio);
router.put('/espacios/:id', isAuthenticated, escenarioController.updateEspacio);
router.delete('/espacios/:id', isAuthenticated, escenarioController.deleteEspacio);

export default router;

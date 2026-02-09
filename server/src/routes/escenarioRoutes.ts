import express from 'express';
import * as escenarioController from '../controllers/escenarioController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.get('/escenarios', escenarioController.getEscenarios);
router.post('/escenarios', isAuthenticated, escenarioController.createEscenario);
router.put('/escenarios/:id', isAuthenticated, escenarioController.updateEscenario);
router.delete('/escenarios/:id', isAuthenticated, escenarioController.deleteEscenario);

export default router;

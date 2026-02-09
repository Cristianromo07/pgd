import { Router } from 'express';
import authRoutes from './authRoutes';
import reservaRoutes from './reservaRoutes';
import horarioRoutes from './horarioRoutes';
import novedadRoutes from './novedadRoutes';
import escenarioRoutes from './escenarioRoutes';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use(authRoutes);
router.use(reservaRoutes);
router.use(horarioRoutes);
router.use(novedadRoutes);
router.use(escenarioRoutes);

export default router;

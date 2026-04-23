import { Router } from 'express';
import { matchController } from '../controllers/match.controller';

const router = Router();

router.get('/stats', matchController.getStatistics); // Specific routes first
router.get('/', matchController.getMatches);
router.get('/:id', matchController.getMatchById);
router.post('/', matchController.createMatch);
router.patch('/:id', matchController.updateMatch);
router.delete('/:id', matchController.deleteMatch);

export default router;
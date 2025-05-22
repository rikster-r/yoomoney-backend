import { Router } from 'express';
import * as paymentsController from '../controllers/paymentsController.js';

const router = Router();

router.get('/payment', paymentsController.createPayment);

export default router;

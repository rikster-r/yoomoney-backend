import { Router } from 'express';
import * as paymentsController from '../controllers/paymentsController.js';

const router = Router();
// Для получения ссылки на оплату
router.post('/payment', paymentsController.createPayment);

// Для получения платежей пользователя
router.get('/payments/user/:userId', paymentsController.getUserPayments);

// Получить информацию об оплате - подходит для запросов о статусе оплаты
router.get('/payments/:paymentId', paymentsController.getPaymentData);

// Webhook tilda
router.post('/', (req, res) => {return res.status(200).json({success: true})})

export default router;

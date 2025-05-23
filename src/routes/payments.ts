import { Router } from 'express';
import * as paymentsController from '../controllers/paymentsController.js';

const router = Router();
// Для получения ссылки на оплату
router.post('/payment', paymentsController.createPayment);

// Вебхук для получения ответа от банка с подтверждением
router.post('/payment/confirm/webhook', paymentsController.confirmPayment);

// Получить статус оплаты - подходит для постоянных запросов пока не изменится статус
router.get('/payments/status/:paymentId', paymentsController.getPaymentStatus);

// Для получения платежей пользователя
router.get('/payments/:userId', paymentsController.getUserPayments);

export default router;

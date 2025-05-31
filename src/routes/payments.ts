import { Router } from 'express';
import * as paymentsController from '../controllers/paymentsController.js';
import { checkYooKassaIP } from '../lib/yookassa.js';

const router = Router();
// Для получения ссылки на оплату
router.post('/payment', paymentsController.createPayment);

// Для получения уведомлений от юкасссы
router.post(
  '/payments/notifications',
  checkYooKassaIP,
  paymentsController.processNotification
);

// Для получения платежей пользователя
router.get('/payments/user/:userId', paymentsController.getAllUserPayments);

// Для изменения статуса получения предметов в игре: получены или нет
/* 
Request body: - 
  {
    received: boolean
  }
*/
router.post(
  '/payments/user/:userId/itemsReceived',
  paymentsController.setItemsReceivedStatus
);

// Для получения информацию о платеже
router.get('/payments/:paymentId', paymentsController.getPaymentData);

export default router;

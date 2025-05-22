import { type Request, type Response } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

let orderCount = 1;

// testing
const instance = axios.create({
  baseURL: 'https://api.yookassa.ru/v3',
  auth: {
    //username: process.env.SHOP_ID!,
    //password: process.env.SECRET_KEY!,
    username: '1092648',
    password: 'test_YWI3tmIa8on7BVuEsbRBV3yrUbygfRedxve0EtL8Vmw',
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function createPayment(req: Request, res: Response) {
  try {
    const { userId, amount } = req.body;
    const idempotenceKey = uuidv4(); // уникальный ключ для повторной отправки запроса

    if (!userId) {
      return res.status(400).json('Укажите айди пользователя');
    }

    if (!amount) {
      return res.status(400).json('Укажите сумму платежа');
    }

    // Создать платеж
    const response = await instance.post(
      '/payments',
      {
        amount: {
          value: 2,
          currency: 'RUB',
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: 'https://project4462332.tilda.ws',
        },
        description: `Заказ #${orderCount}`,
        metadata: {
          user_id: userId,
          order_id: orderCount,
        },
      },
      {
        headers: {
          'Idempotence-Key': idempotenceKey,
        },
      }
    );

    const paymentLink = response.data.confirmation?.confirmation_url;
    if (!paymentLink) {
      return res.status(500).json({ error: 'Не удалось создать платеж' });
    }

    // Создать webhook для получения результата оплаты
    // await instance.post('/webhooks', {
    //   event: 'payment.succeeded',
    //   url: `${req.get('Host')}/payment/confirm/webhook`,
    // });

    orderCount++;
    return res.status(302).redirect(paymentLink);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Ошибка сервера при создании платежа:', error);
    } else {
      console.error('Ошибка сервера при создании платежа:', error);
    }
    res.status(500).json({ error: 'Ошибка сервера при создании платежа' });
  }
}

export async function confirmPayment(req: Request, res: Response) {
  try {
    const { event } = req.body;
    console.log(req.body);

    if (event.type === 'payment.succeeded') {
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(200).json({ status: 'ignored' });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Ошибка сервера при подтверждении платежа:', error.message);
    } else {
      console.error('Ошибка сервера при подвтверждении платежа:', error);
    }
    res.status(500).json({ error: 'Ошибка сервера при создании платежа' });
  }
}

export async function getUserPayments(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const response = await instance.get('/payments?limit=100');
    const data = response.data.items.filter(
      (item: any) => item.metadata.user_id === userId
    );

    return res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Ошибка сервера при подтверждении платежа:', error.message);
    } else {
      console.error('Ошибка сервера при подвтверждении платежа:', error);
    }
    res.status(500).json({ error: 'Ошибка сервера при создании платежа' });
  }
}

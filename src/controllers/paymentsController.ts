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
    const {
      userId,
      items,
    }: {
      // user id - строка
      userId: string;
      // items - массив объектов
      // item.id, item.name, item.price - обязательные поля
      items: { id: number; name: string; price: number }[];
    } = req.body;
    const idempotenceKey = uuidv4(); // уникальный ключ для повторной отправки запроса

    if (!userId) {
      return res.status(400).json('Укажите айди пользователя');
    }

    if (!items || !items.length) {
      return res.status(400).json('Укажите предметы оплаты');
    }

    const amount = items.reduce((sum, item) => sum + item.price, 0).toFixed(2);

    // Создать платеж
    const response = await instance.post(
      '/payments',
      {
        amount: {
          value: amount,
          currency: 'RUB',
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: 'https://project4462332.tilda.ws',
        },
        description: `Заказ для аккаунта ${userId}`,
        metadata: {
          user_id: userId,
          order_id: orderCount,
          items: JSON.stringify(items),
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

    orderCount++;
    return res.status(200).json({
      paymentId: response.data.id,
      redirectUrl: paymentLink,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Ошибка сервера при создании платежа:', error);
    } else {
      console.error('Ошибка сервера при создании платежа:', error);
    }
    res.status(500).json({ error: 'Ошибка сервера при создании платежа' });
  }
}

export async function getPaymentData(req: Request, res: Response) {
  try {
    const { paymentId } = req.params;

    const response = await instance.get(`/payments/${paymentId}`);
    const payment = response.data;

    payment.metadata.items = JSON.parse(payment.metadata.items);

    return res.status(200).json(payment);
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
    const data = response.data.items
      // Оставить только платежи выбранного пользователя
      .filter((item: any) => item.metadata.user_id === userId)
      // Спарсить данные оплаченных предметов обратно в массив
      .map(
        (item: any) => (item.metadata.items = JSON.parse(item.metadata.items))
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

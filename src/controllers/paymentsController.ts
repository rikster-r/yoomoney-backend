import { type Request, type Response } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase.js';

function generateOrderNumber() {
  const now = Date.now(); // timestamp
  const random = Math.floor(Math.random() * 1000); // 000–999
  return `${now}-${random}`;
}

// testing
const instance = axios.create({
  baseURL: 'https://api.yookassa.ru/v3',
  auth: {
    //temp
    username: '1092648',
    password: 'test_YWI3tmIa8on7BVuEsbRBV3yrUbygfRedxve0EtL8Vmw',
    // username: process.env.SHOP_ID!,
    // password: process.env.SECRET_KEY!,
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
      // item.id, item.amount, item.name, item.price - обязательные поля
      items: { id: number; amount: number; name: string; price: number }[];
    } = req.body;
    const idempotenceKey = uuidv4(); // уникальный ключ для повторной отправки запроса

    if (!userId) {
      return res.status(400).json('Укажите айди пользователя');
    }

    if (!items || !items.length) {
      return res.status(400).json('Укажите предметы оплаты');
    }

    const amount = items
      .reduce((sum, item) => sum + Number(item.price), 0)
      .toFixed(2);
    const orderNumber = generateOrderNumber();

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
        description: `Заказ  №${orderNumber}`,
        metadata: {
          user_id: userId,
          items: JSON.stringify(items),
        },
      },
      {
        headers: {
          'Idempotence-Key': idempotenceKey,
        },
      }
    );

    const payment = response.data;

    const { error: supabaseError } = await supabase.from('payments').insert([
      {
        yoomoney_id: payment.id,
        user_id: userId,
        items,
        status: payment.status,
        items_received: false,
      },
    ]);

    if (supabaseError) {
      console.error(supabaseError);
      return res.status(500).json({ error: 'Не удалось создать платеж' });
    }

    const paymentLink = payment.confirmation?.confirmation_url;
    if (!paymentLink) {
      return res.status(500).json({ error: 'Не удалось создать платеж' });
    }

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

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('yoomoney_id', paymentId);

    if (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ошибка сервера при получении платежа',
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Ошибка сервера при получении платежа:', error.message);
    } else {
      console.error('Ошибка сервера при получении платежа:', error);
    }
    res.status(500).json({ error: 'Ошибка сервера при получении платежа' });
  }
}

export async function getAllUserPayments(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('userId', userId);

    if (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ошибка сервера при получении платежа',
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Ошибка сервера при получении платежа:', error.message);
    } else {
      console.error('Ошибка сервера при получении платежа:', error);
    }
    res.status(500).json({ error: 'Ошибка сервера при получении платежа' });
  }
}

export async function setItemsReceivedStatus(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { received } = req.body;

    const { error } = await supabase
      .from('payments')
      .update({ items_received: received })
      .eq('user_id', userId);

    if (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ошибка сервера при получении платежа',
      });
    }

    return res.status(200).json({
      error: null,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        'Ошибка сервера при обновлении статуса предметов платежа:',
        error.message
      );
    } else {
      console.error(
        'Ошибка сервера при обновлении статуса предметов платежа:',
        error
      );
    }
    res.status(500).json({
      error: 'Ошибка сервера при обновлении статуса предметов платежа',
    });
  }
}

export async function processNotification(req: Request, res: Response) {
  try {
    const { object } = req.body;

    const { error } = await supabase
      .from('payments')
      .update({ status: object.status })
      .eq('yoomoney_id', object.id);

    if (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Ошибка сервера при получении платежа',
      });
    }

    return res.status(200).json({
      error: null,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        'Ошибка сервера при обновлении статуса предметов платежа:',
        error.message
      );
    } else {
      console.error(
        'Ошибка сервера при обновлении статуса предметов платежа:',
        error
      );
    }
    res.status(500).json({
      error: 'Ошибка сервера при обновлении статуса предметов платежа',
    });
  }
}

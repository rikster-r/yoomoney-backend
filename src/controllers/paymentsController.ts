import { type Request, type Response } from 'express';

export const createPayment = (req: Request, res: Response) => {
  return res.status(200).json('Все ахуенно');
};

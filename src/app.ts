import express, { type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import createError, { type HttpError } from 'http-errors';
import logger from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: '*',
  })
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
import paymentsRouter from './routes/payments.js';

app.use('/', paymentsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err: HttpError, req: Request, res: Response) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;

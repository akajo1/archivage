import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

type ErrorLike = {
  code?: unknown;
  message?: unknown;
  cause?: unknown;
};

const hasCode = (value: unknown, code: string) => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (value as ErrorLike).code === code;
};

const hasMessage = (value: unknown, fragment: string) => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const message = (value as ErrorLike).message;

  return typeof message === 'string' && message.includes(fragment);
};

const isDatabaseUnavailable = (exception: unknown) => {
  if (!exception || typeof exception !== 'object') {
    return false;
  }

  const error = exception as ErrorLike;

  return (
    hasCode(error, 'ECONNREFUSED') ||
    hasCode(error, 'P1001') ||
    hasCode(error.cause, 'ECONNREFUSED') ||
    hasCode(error.cause, 'P1001') ||
    hasMessage(error, 'ECONNREFUSED') ||
    hasMessage(error, "Can't reach database server")
  );
};

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      return response.status(status).json(
        typeof payload === 'string'
          ? {
              statusCode: status,
              error: exception.name,
              message: payload,
            }
          : payload,
      );
    }

    if (isDatabaseUnavailable(exception)) {
      return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'Service Unavailable',
        message:
          'La base de données PostgreSQL est inaccessible. Vérifiez DATABASE_URL et démarrez PostgreSQL avant de réessayer.',
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Une erreur serveur inattendue est survenue.',
    });
  }
}

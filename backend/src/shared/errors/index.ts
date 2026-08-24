export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details: any[] = []
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required.') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Permission denied.') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found.') {
    super('NOT_FOUND', message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource state conflict.') {
    super('CONFLICT', message, 409);
  }
}

export class InsufficientStockError extends AppError {
  constructor(message: string = 'Insufficient stock available.') {
    super('STOCK_INSUFFICIENT', message, 422);
  }
}

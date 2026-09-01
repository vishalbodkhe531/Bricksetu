import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  errors?: Record<string, string[]>;
}

export function successResponse<T>(
  data: T,
  message?: string,
  statusCode = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      ...(message ? { message } : {}),
      data,
    },
    { status: statusCode }
  );
}

export function errorResponse(
  message: string,
  error?: any,
  statusCode = 500
): NextResponse<ApiResponse> {
  if (error instanceof ZodError) {
    const formattedErrors: Record<string, string[]> = {};
    error.issues.forEach((issue) => {
      const field = issue.path.join('.');
      if (!formattedErrors[field]) formattedErrors[field] = [];
      formattedErrors[field].push(issue.message);
    });

    return NextResponse.json(
      {
        success: false,
        message: message || 'Validation Error',
        errors: formattedErrors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message: 'A record with this unique value already exists.',
          error: error.meta,
        },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          message: 'Requested record was not found.',
        },
        { status: 404 }
      );
    }
  }

  return NextResponse.json(
    {
      success: false,
      message: message || 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? (error?.message || error) : undefined,
    },
    { status: statusCode }
  );
}

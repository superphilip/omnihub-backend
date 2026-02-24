import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { Prisma } from '../database/prismaClient.js';
import { ZodError } from 'zod';

// ═══════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════

interface SyntaxErrorWithBody extends SyntaxError {
  body: string;
  status: number;
  statusCode: number;
}

function isSyntaxErrorWithBody(err: unknown): err is SyntaxErrorWithBody {
  return (
    err instanceof SyntaxError &&
    'body' in err &&
    typeof (err as any).body === 'string'
  );
}

interface MulterError extends Error {
  code: string;
  field?: string;
  storageErrors?: Error[];
}

function isMulterError(err: unknown): err is MulterError {
  return (
    err instanceof Error &&
    err.name === 'MulterError' &&
    'code' in err
  );
}

// ═══════════════════════════════════════════════════════
// ERROR HANDLER
// ═══════════════════════════════════════════════════════

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log completo del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('═══════════════════════════════════════');
    console.error('❌ ERROR CAPTURADO: ');
    console.error('   Tipo:', err instanceof Error ? err.constructor.name : typeof err);
    console.error('   Mensaje:', err instanceof Error ? err.message : String(err));
    console.error('   Stack:', err instanceof Error ? err.stack : 'No stack trace');
    console.error('   Request:', {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
    });
    console.error('═══════════════════════════════════════\n');
  }

  // ═══════���═══════════════════════════════════════════════
  // 1. APP ERROR (errores controlados)
  // ═══════════════════════════════════════════════════════
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // ═══════════════════════════════════════════════════════
  // 2. ZOD VALIDATION ERROR
  // ═══════════════════════════════════════════════════════
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      statusCode: 400,
      errors: err.issues.map((issue) => ({  // ← CAMBIO: err.issues en lugar de err.errors
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        zodError: err.format(),
      }),
    });
  }

  // ═══════════════════════════════════════════════════════
  // 3. PRISMA ERRORS
  // ═══════════════════════════════════════════════════════

  // Prisma Known Request Error (P2xxx)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let message = 'Database error';
    let statusCode = 500;

    switch (err.code) {
      case 'P2002': {
        const duplicateFields = (err.meta?.target as string[]) ?? [];
        // Si no hay campos, agrega más contexto al error
        console.error('[P2002 DUPLICATE]', { duplicateFields, model: err.meta?.modelName, meta: err.meta, body: req.body, path: req.path });
        let message = `Duplicate value error`;
        if (duplicateFields.length) {
          message += ` for field(s): ${duplicateFields.join(', ')}`;
        } else if (err.meta?.modelName) {
          message += ` in ${err.meta.modelName}`;
        }
        return res.status(409).json({
          success: false,
          error: message,
          statusCode: 409,
          fields: duplicateFields.length > 0 ? duplicateFields : undefined,
          model: err.meta?.modelName,
        });
      }
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        statusCode = 400;
        break;
      case 'P2014':
        message = 'Invalid relation';
        statusCode = 400;
        break;
      case 'P2016':
        message = 'Query interpretation error';
        statusCode = 400;
        break;
      case 'P2021':
        message = 'Table does not exist';
        statusCode = 500;
        break;
      case 'P2022':
        message = 'Column does not exist';
        statusCode = 500;
        break;
      default:
        message = `Database error: ${err.message}`;
    }

    return res.status(statusCode).json({
      success: false,
      error: message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        prismaCode: err.code,
        prismaMessage: err.message,
        meta: err.meta,
        stack: err.stack,
      }),
    });
  }

  // Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Invalid data provided to database',
      statusCode: 400,
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message,
        stack: err.stack,
      }),
    });
  }

  // Prisma Initialization Error
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(500).json({
      success: false,
      error: 'Database connection error',
      statusCode: 500,
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message,
        stack: err.stack,
      }),
    });
  }

  // Prisma Rust Panic Error
  if (err instanceof Prisma.PrismaClientRustPanicError) {
    return res.status(500).json({
      success: false,
      error: 'Critical database error',
      statusCode: 500,
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message,
        stack: err.stack,
      }),
    });
  }

  // ═══════════════════════════════════════════════════════
  // 4. JWT ERRORS
  // ═══════════════════════════════════════════════════════
  if (err instanceof Error && err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      statusCode: 401,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  if (err instanceof Error && err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      statusCode: 401,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // ═══════════════════════════════════════════════════════
  // 5. MULTER ERRORS (File Upload)
  // ═══════════════════════════════════════════════════════
  if (isMulterError(err)) {
    let message = 'File upload error';

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        break;
      default:
        message = `File upload error: ${err.message}`;
    }

    return res.status(400).json({
      success: false,
      error: message,
      statusCode: 400,
      ...(process.env.NODE_ENV === 'development' && {
        multerCode: err.code,
        field: err.field,
        stack: err.stack,
      }),
    });
  }

  // ═══════════════════════════════════════════════════════
  // 6. SYNTAX ERRORS (Invalid JSON)
  // ═══════════════════════════════════════════════════════
  if (isSyntaxErrorWithBody(err)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body',
      statusCode: 400,
      ...(process.env.NODE_ENV === 'development' && {
        details: err.message,
        stack: err.stack,
      }),
    });
  }

  // ═══════════════════════════════════════════════════════
  // 7. ERROR GENÉRICO (cualquier Error estándar)
  // ═══════════════════════════════════════════════════════
  if (err instanceof Error) {
    return res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Something went wrong',
      statusCode: 500,
      ...(process.env.NODE_ENV === 'development' && {
        type: err.constructor.name,
        message: err.message,
        stack: err.stack,
      }),
    });
  }

  // ═══════════════════════════════════════════════════════
  // 8. ERROR DESCONOCIDO (no es instancia de Error)
  // ═══════════════════════════════════════════════════════
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    statusCode: 500,
    ...(process.env.NODE_ENV === 'development' && {
      type: typeof err,
      value: String(err),
    }),
  });
};
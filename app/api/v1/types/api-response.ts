import { Prisma } from "@prisma/client";

/**
 * @swagger
 * components:
 *   schemas:
 *    ApiError:
 *      type: object
 *      required:
 *        - message
 *      properties:
 *        status:
 *          type: integer
 *          format: int32
 *          description: An optional error code representing the error type. For example, 400 for Bad Request, 401 for Unauthorized, 403 for Forbidden, 404 for Not Found, 500 for Internal Server Error.
 *        code:
 *          type: string
 *          nullable: true
 *          description: A brief description of the error message.
 *        message:
 *          type: string
 *          description: A detailed message describing the error message.
 */
export type ApiError = {
  status: number;
  code: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR' | string;
  message: string;
};

export class ActionError extends Error implements ApiError {
  status: number;
  code: ApiError['code'];

  // Common status codes for errors
  // 400 - Bad Request
  // 401 - Unauthorized
  // 403 - Forbidden
  // 404 - Not Found
  // 500 - Internal Server Error
  constructor(code: 'error', status = 400, message = 'Unexpected error occurred') {
    super(message);
    this.name = 'ActionError';
    this.code = code;
    this.status = status || 500;
    this.message = message;
  }

  toString(): string {
    return `[Error (${this.status})]: ${this.message}`;
  }

  toJson(): ApiError {
    return {
      status: this.status,
      code: this.code,
      message: this.message,
    };
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *    ApiSuccess:
 *      type: object
 *      required:
 *        - status
 *        - message
 *      properties:
 *        status:
 *          type: string
 *          description: A brief description of the successful operation.
 *          examples:
 *            - OK
 *        message:
 *          type: string
 *          description: A brief message of the successful operation.
 *          examples:
 *            - Operation successful.
 *        data:
 *          oneOf:
 *            - type: object
 *              additionalProperties: true
 *              description: An arbitrary object returned by the operation.
 *            - type: array
 *              items:
 *                type: object
 *                additionalProperties: true
 *              description: An array of arbitrary objects returned by the operation.
 */
export type ApiSuccess<T> = {
  status: string;
  message: string;
  data?: T | T[];
};


export class PrismaActionError extends Prisma.PrismaClientKnownRequestError {
  constructor(error: Prisma.PrismaClientKnownRequestError) {
    const { code, clientVersion, meta, batchRequestIdx } = error;

    // Extract the necessary parameters from the error object to pass to the superclass
    super(error.message, { code, clientVersion, meta, batchRequestIdx });
  }

  toJson(): ApiError {
    return {
      status: this.determineStatusCode(this.code),
      code: this.code,
      message: this.friendlyMessage(this),
    };
  }

  determineStatusCode(code: string): number {
    switch (code) {
      case 'P2000':
        return 400; // Bad Request
      case 'P2001':
        return 404; // Not Found
      case 'P2002':
        return 409; // Conflict
      case 'P2003':
      case 'P2004':
      case 'P2005':
      case 'P2006':
      case 'P2007':
        return 400; // Bad Request
      case 'P2008':
        return 500; // Internal Server Error
      case 'P2009':
      case 'P2010':
      case 'P2011':
      case 'P2012':
      case 'P2013':
      case 'P2014':
      case 'P2015':
      case 'P2016':
      case 'P2017':
      case 'P2018':
      case 'P2019':
      case 'P2020':
      case 'P2021':
      case 'P2022':
      case 'P2023':
      case 'P2024':
        return 400; // Bad Request
      case 'P2025':
        return 404; // Not Found
      case 'P2026':
        return 500; // Internal Server Error
      case 'P2027':
        return 400; // Bad Request
      default:
        return 500; // Internal Server Error
    }
  }

  friendlyMessage(error: Prisma.PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2000':
        return 'The provided value for the column is too long for the column\'s type.';
      case 'P2001':
        return 'The record was not found.';
      case 'P2002':
        const fields = (error.meta?.target as any[] || []).join(', ');
        return `A record with the same ${fields} already exists.`;
      case 'P2003':
        return 'Foreign key constraint failed on the field.';
      case 'P2004':
        return 'A constraint failed on the database.';
      case 'P2005':
        return 'The value stored in the database is invalid for the field.';
      case 'P2006':
        return 'The provided value for the model is invalid.';
      case 'P2007':
        return 'Data validation error.';
      case 'P2008':
        return 'Failed to parse the query.';
      case 'P2009':
        return 'Failed to validate the query.';
      case 'P2010':
        return 'Raw query failed.';
      case 'P2011':
        return 'Null constraint violation on a field.';
      case 'P2012':
        return 'Missing a required value.';
      case 'P2013':
        return 'Missing the required argument.';
      case 'P2014':
        return 'Relation violation.';
      case 'P2015':
        return 'Related record not found.';
      case 'P2016':
        return 'Query interpretation error.';
      case 'P2017':
        return 'The records for a relation are not connected.';
      case 'P2018':
        return 'The required connected records were not found.';
      case 'P2019':
        return 'Input error.';
      case 'P2020':
        return 'Value out of range for the type.';
      case 'P2021':
        return 'The table does not exist in the database.';
      case 'P2022':
        return 'The column does not exist in the database.';
      case 'P2023':
        return 'Inconsistent column data.';
      case 'P2024':
        return 'Timed out while fetching results from the database.';
      case 'P2025':
        return 'The requested record could not be found.';
      case 'P2026':
        return 'The current database provider doesn\'t support this query.';
      case 'P2027':
        return 'Multiple errors occurred.';
      default:
        return 'An unexpected error occurred while interacting with the database.';
    }
  }
}
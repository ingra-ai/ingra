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
  constructor(code: "error", status = 400, message = 'Unexpected error occurred') {
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
      message: this.message
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
 *          example: OK
 *        message:
 *          type: string
 *          description: A brief message of the successful operation.
 *          example: Operation successful.
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
export type ApiSuccess<T extends object> = {
  status: string;
  message: string;
  data?: T | T[];
}

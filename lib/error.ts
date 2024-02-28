type KnownErrorCode = 
  'invalid_code' | 
  'code_expired' | 
  'invalid_credentials' | 
  'user_not_found' | 
  'user_exists' | 
  'invalid_token' | 
  'token_expired' | 
  'invalid_request' | 
  'internal_error' |
  'unknown';

interface ActionErrorData {
  code: KnownErrorCode;
  message: string;
  details?: string;
}

class ActionError extends Error {
  status: "error" | "success";
  statusCode: number;
  message: string;
  data?: ActionErrorData;

  // Common status codes for errors
  // 400 - Bad Request
  // 401 - Unauthorized
  // 403 - Forbidden
  // 404 - Not Found
  // 500 - Internal Server Error
  constructor(status: "error" | "success", statusCode = 400, message: string) {
    super(message);
    this.name = 'ActionError';
    this.status = status;
    this.statusCode = statusCode || -1;
    this.message = message;
  }

  setData(data: ActionErrorData): void {
    this.data = data;
  }

  toString(): string {
    return `${this.status} (${this.statusCode}): ${this.message}`;
  }
}

export {
  ActionError
};

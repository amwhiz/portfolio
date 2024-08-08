export class AppError extends Error {
  statusCode: number;
  constructor(message = '', statusCode = 200) {
    super(message);
    this.statusCode = statusCode;
  }
}

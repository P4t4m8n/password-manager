export interface IHttpErrorResponseDto {
  message: string;
  statusCode: number;
  errors?: Record<string, string | string[]>;
}

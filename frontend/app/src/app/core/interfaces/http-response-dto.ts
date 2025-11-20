export interface IHttpResponseDto<T> {
  data: T;
  message: string;
  statusCode: number;
}

export enum toastTypes {
  error,
  success,
}

export interface IToastData {
  title: string;
  content: string;
  show?: boolean;
  type?: toastTypes;
  progressWidth?: string;
}

import { toastTypes } from '../enum/toast-type.enum';

export interface IToastData {
  title: string;
  content: string;
  show?: boolean;
  type?: toastTypes;
  progressWidth?: string;
}

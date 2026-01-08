import { TPasswordStrengthLevel } from '../types/password.types';



export interface IPasswordSafetyDashboardValue {
  label: string;
  value: number;
}

export interface IPasswordEvaluation {
  totalScore: number;
  numberOfAttentionPasswords: number;
  passwordSafetyDashboardValues: IPasswordSafetyDashboardValue[];
}

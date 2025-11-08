export interface IPasswordOptions {
  passwordLength: number | null;
  includeSymbols: boolean | null;
  includeNumbers: boolean | null;
  includeUppercase: boolean | null;
  includeSimilarCharacters: boolean | null;
  includesLowercase: boolean | null;
  password: string | null;
}

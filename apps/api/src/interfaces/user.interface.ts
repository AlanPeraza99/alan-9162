export interface User {
  id: string;
  fullName: string;
  email: string;
  balance: number;
  passwordHash: string;
  passwordSalt: string;
}

export type UserRole = 'admin' | 'devops' | 'developer';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  role: UserRole;
} 
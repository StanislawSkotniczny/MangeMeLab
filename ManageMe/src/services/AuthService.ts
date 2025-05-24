import type { User, UserRole } from '../models/User';

const users: User[] = [
  { id: '1', firstName: 'Jan', lastName: 'Kowalski', role: 'admin' },
  { id: '2', firstName: 'Anna', lastName: 'Nowak', role: 'developer' },
  { id: '3', firstName: 'Piotr', lastName: 'Zieliński', role: 'devops' }
];

export class AuthService {
  // Mockowany użytkownik 
  private static currentUser: User = users[0];

  static getCurrentUser(): User {
    return this.currentUser;
  }

  static getAllUsers(): User[] {
    return users;
  }
} 
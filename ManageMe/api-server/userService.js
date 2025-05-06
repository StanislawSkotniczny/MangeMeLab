export class UserService {
  constructor() {
    this.users = [
      { id: 1, login: 'admin', password: 'admin', firstName: 'Jan', lastName: 'Kowalski', role: 'admin' },
      { id: 2, login: 'dev', password: 'dev', firstName: 'Anna', lastName: 'Nowak', role: 'developer' }
    ];
  }

  findByLogin(login) {
    return this.users.find(u => u.login === login);
  }

  findById(id) {
    return this.users.find(u => u.id === id);
  }

  validateUser(login, password) {
    const user = this.findByLogin(login);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
}

const userService = new UserService();
export default userService; 
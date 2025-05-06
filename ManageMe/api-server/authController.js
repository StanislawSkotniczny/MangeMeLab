import jwt from 'jsonwebtoken';
import userService from './userService.js';

const SECRET = 'tajny_klucz';
const REFRESH_SECRET = 'tajny_refresh';

class AuthController {
  login(req, res) {
    const { login, password } = req.body;
    const user = userService.validateUser(login, password);
    if (!user) return res.status(401).json({ error: 'Błędny login lub hasło' });

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
    res.json({ token, refreshToken });
  }

  refresh(req, res) {
    const { refreshToken } = req.body;
    try {
      const payload = jwt.verify(refreshToken, REFRESH_SECRET);
      const user = userService.findById(payload.id);
      if (!user) throw new Error();
      const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '15m' });
      res.json({ token });
    } catch {
      res.status(401).json({ error: 'Nieprawidłowy refreshToken' });
    }
  }

  me(req, res) {
    const user = userService.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
    const { password, ...userData } = user;
    res.json(userData);
  }
}

const authController = new AuthController();
export default authController; 
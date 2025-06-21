import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import authController from './authController.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET = 'tajny_klucz';

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Brak tokenu' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Nieprawidłowy token' });
  }
}

// endpointy
app.post('/api/login', (req, res) => authController.login(req, res));
app.post('/api/refresh', (req, res) => authController.refresh(req, res));
app.get('/api/me', auth, (req, res) => authController.me(req, res));

app.listen(3000, () => console.log('API działa na http://localhost:3000')); 
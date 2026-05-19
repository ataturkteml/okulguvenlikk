const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { ogrenciLogin, adminLogin } = require('../controllers/authController');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10,
  message: { success: false, message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/ogrenci-login', loginLimiter, ogrenciLogin);
router.post('/admin-login', loginLimiter, adminLogin);

module.exports = router;

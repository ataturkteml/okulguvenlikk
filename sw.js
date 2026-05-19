const express = require('express');
const router = express.Router();
const { authOgrenci } = require('../middleware/auth');
const { getProfil, islemYap, getGecmis, getBildirimler, bildirimOku } = require('../controllers/ogrenciController');

router.get('/profil', authOgrenci, getProfil);
router.post('/islem-yap', authOgrenci, islemYap);
router.get('/gecmis', authOgrenci, getGecmis);
router.get('/bildirimler', authOgrenci, getBildirimler);
router.post('/bildirimler/:id/oku', authOgrenci, bildirimOku);

module.exports = router;

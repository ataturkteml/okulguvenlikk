const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middleware/auth');
const {
  ogrenciEkle, ogrenciGuncelle, ogrenciSil, ogrenciListesi,
  getLoglari, getDashboard, bildirimGonder, sifreDegistir, guvenlikciOku
} = require('../controllers/adminController');

router.get('/dashboard', authAdmin, getDashboard);
router.post('/ogrenci-ekle', authAdmin, ogrenciEkle);
router.get('/ogrenciler', authAdmin, ogrenciListesi);
router.put('/ogrenciler/:id', authAdmin, ogrenciGuncelle);
router.delete('/ogrenciler/:id', authAdmin, ogrenciSil);
router.get('/loglar', authAdmin, getLoglari);
router.post('/bildirim-gonder', authAdmin, bildirimGonder);
router.post('/sifre-degistir', authAdmin, sifreDegistir);

// Guvenlikci endpoint - token gerektirmez
router.post('/guvenlikci-oku', guvenlikciOku);

module.exports = router;

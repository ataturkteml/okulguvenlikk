const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet } = require('../config/database');

const ogrenciLogin = (req, res) => {
  const { ogrenci_no, sifre } = req.body;
  if (!ogrenci_no || !sifre)
    return res.status(400).json({ success: false, message: 'Ogrenci no ve sifre gerekli.' });

  const ogrenci = dbGet('SELECT * FROM ogrenciler WHERE ogrenci_no = ?', [ogrenci_no.trim()]);
  if (!ogrenci || !bcrypt.compareSync(sifre, ogrenci.sifre_hash))
    return res.status(401).json({ success: false, message: 'Ogrenci numarasi veya sifre hatali.' });

  const token = jwt.sign(
    { id: ogrenci.id, ogrenci_no: ogrenci.ogrenci_no, rol: 'ogrenci' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({
    success: true, token,
    ogrenci: { id: ogrenci.id, ad_soyad: ogrenci.ad_soyad, ogrenci_no: ogrenci.ogrenci_no, durum: ogrenci.durum, barkod_veri: ogrenci.barkod_veri }
  });
};

const adminLogin = (req, res) => {
  const { kullanici_adi, sifre } = req.body;
  if (!kullanici_adi || !sifre)
    return res.status(400).json({ success: false, message: 'Kullanici adi ve sifre gerekli.' });

  const admin = dbGet('SELECT * FROM yoneticiler WHERE kullanici_adi = ?', [kullanici_adi.trim()]);
  if (!admin || !bcrypt.compareSync(sifre, admin.sifre_hash))
    return res.status(401).json({ success: false, message: 'Kullanici adi veya sifre hatali.' });

  const token = jwt.sign(
    { id: admin.id, kullanici_adi: admin.kullanici_adi, rol: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  res.json({ success: true, token, admin: { id: admin.id, kullanici_adi: admin.kullanici_adi } });
};

module.exports = { ogrenciLogin, adminLogin };

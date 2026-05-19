const bcrypt = require('bcryptjs');
const { dbGet, dbQuery, dbRun } = require('../config/database');

const barcodOlustur = (ogrenci_no) => {
  const yil = new Date().getFullYear();
  const kisa = ogrenci_no.length > 4 ? ogrenci_no.slice(-4) : ogrenci_no.padStart(4, '0');
  return `OKL-${yil}-${kisa}`;
};

const ogrenciEkle = (req, res) => {
  const { ogrenci_no, ad_soyad, sinif, sifre } = req.body;
  if (!ogrenci_no || !ad_soyad || !sifre)
    return res.status(400).json({ success: false, message: 'Ogrenci no, ad soyad ve sifre gerekli.' });
  if (sifre.length < 4)
    return res.status(400).json({ success: false, message: 'Sifre en az 4 karakter olmali.' });

  if (dbGet('SELECT id FROM ogrenciler WHERE ogrenci_no = ?', [ogrenci_no.trim()]))
    return res.status(409).json({ success: false, message: 'Bu ogrenci numarasi zaten kayitli.' });

  const barkod_veri = barcodOlustur(ogrenci_no.trim());
  if (dbGet('SELECT id FROM ogrenciler WHERE barkod_veri = ?', [barkod_veri]))
    return res.status(409).json({ success: false, message: 'Barkod cakismasi, ogrenci nosunu kontrol edin.' });

  const sifre_hash = bcrypt.hashSync(sifre, 10);
  const result = dbRun(
    'INSERT INTO ogrenciler (ogrenci_no, ad_soyad, sinif, sifre_hash, barkod_veri) VALUES (?, ?, ?, ?, ?)',
    [ogrenci_no.trim(), ad_soyad.trim(), (sinif || '').trim(), sifre_hash, barkod_veri]
  );

  res.status(201).json({
    success: true,
    message: 'Ogrenci basariyla eklendi.',
    ogrenci: { id: result.lastInsertRowid, ogrenci_no: ogrenci_no.trim(), ad_soyad: ad_soyad.trim(), sinif: (sinif||'').trim(), barkod_veri, durum: 'DISARIDA' }
  });
};

const ogrenciGuncelle = (req, res) => {
  const { id } = req.params;
  const { ad_soyad, sinif, sifre } = req.body;
  if (!dbGet('SELECT id FROM ogrenciler WHERE id = ?', [id]))
    return res.status(404).json({ success: false, message: 'Ogrenci bulunamadi.' });

  if (ad_soyad) dbRun('UPDATE ogrenciler SET ad_soyad = ? WHERE id = ?', [ad_soyad.trim(), id]);
  if (sinif !== undefined) dbRun('UPDATE ogrenciler SET sinif = ? WHERE id = ?', [(sinif||'').trim(), id]);
  if (sifre && sifre.length >= 4) {
    const hash = bcrypt.hashSync(sifre, 10);
    dbRun('UPDATE ogrenciler SET sifre_hash = ? WHERE id = ?', [hash, id]);
  }
  res.json({ success: true, message: 'Ogrenci guncellendi.' });
};

const ogrenciSil = (req, res) => {
  const { id } = req.params;
  if (!dbGet('SELECT id FROM ogrenciler WHERE id = ?', [id]))
    return res.status(404).json({ success: false, message: 'Ogrenci bulunamadi.' });
  dbRun('DELETE FROM loglar WHERE ogrenci_id = ?', [id]);
  dbRun('DELETE FROM ogrenciler WHERE id = ?', [id]);
  res.json({ success: true, message: 'Ogrenci silindi.' });
};

const ogrenciListesi = (req, res) => {
  const { arama, durum } = req.query;
  let sql = 'SELECT id, ogrenci_no, ad_soyad, sinif, barkod_veri, durum, olusturma_tarihi FROM ogrenciler WHERE 1=1';
  const params = [];
  if (arama) { sql += ' AND (ad_soyad LIKE ? OR ogrenci_no LIKE ? OR sinif LIKE ?)'; params.push(`%${arama}%`, `%${arama}%`, `%${arama}%`); }
  if (durum && ['OKULDA','DISARIDA'].includes(durum)) { sql += ' AND durum = ?'; params.push(durum); }
  sql += ' ORDER BY ad_soyad ASC';
  const ogrenciler = dbQuery(sql, params);
  res.json({ success: true, ogrenciler, toplam: ogrenciler.length });
};

const getLoglari = (req, res) => {
  const { filtre, ogrenci_id, limit = 100, offset = 0 } = req.query;
  let sql = `SELECT l.id, l.ogrenci_id, l.islem_turu, l.tarih_saat, o.ad_soyad, o.ogrenci_no, o.sinif
             FROM loglar l JOIN ogrenciler o ON l.ogrenci_id = o.id WHERE 1=1`;
  const params = [];
  if (filtre && ['GİRİŞ','ÇIKIŞ'].includes(filtre.toUpperCase())) { sql += ' AND l.islem_turu = ?'; params.push(filtre.toUpperCase()); }
  if (ogrenci_id) { sql += ' AND l.ogrenci_id = ?'; params.push(ogrenci_id); }
  sql += ' ORDER BY l.id DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  const loglar = dbQuery(sql, params);
  const toplam = dbGet('SELECT COUNT(*) as cnt FROM loglar', []).cnt;
  res.json({ success: true, loglar, toplam });
};

const getDashboard = (req, res) => {
  const okulda = dbGet("SELECT COUNT(*) as cnt FROM ogrenciler WHERE durum = 'OKULDA'", []).cnt;
  const disarida = dbGet("SELECT COUNT(*) as cnt FROM ogrenciler WHERE durum = 'DISARIDA'", []).cnt;
  const bugunGiris = dbGet("SELECT COUNT(*) as cnt FROM loglar WHERE islem_turu = 'GİRİŞ' AND DATE(tarih_saat) = DATE('now','localtime')", []).cnt;
  const bugunCikis = dbGet("SELECT COUNT(*) as cnt FROM loglar WHERE islem_turu = 'ÇIKIŞ' AND DATE(tarih_saat) = DATE('now','localtime')", []).cnt;
  const sonIslemler = dbQuery(`SELECT l.id, l.islem_turu, l.tarih_saat, o.ad_soyad, o.ogrenci_no, o.sinif FROM loglar l JOIN ogrenciler o ON l.ogrenci_id = o.id ORDER BY l.id DESC LIMIT 10`, []);
  res.json({ success: true, stats: { okulda, disarida, toplam: okulda+disarida, bugunGiris, bugunCikis }, sonIslemler });
};

const bildirimGonder = (req, res) => {
  const { baslik, icerik, hedef_ogrenci_id } = req.body;
  if (!baslik || !icerik) return res.status(400).json({ success: false, message: 'Baslik ve icerik gerekli.' });
  const result = dbRun('INSERT INTO bildirimler (baslik, icerik, hedef_ogrenci_id) VALUES (?, ?, ?)', [baslik.trim(), icerik.trim(), hedef_ogrenci_id || null]);
  const bildirim = dbGet('SELECT * FROM bildirimler WHERE id = ?', [result.lastInsertRowid]);
  if (req.app.get('io')) {
    if (hedef_ogrenci_id) req.app.get('io').to(`ogrenci-${hedef_ogrenci_id}`).emit('yeni-bildirim', bildirim);
    else req.app.get('io').to('ogrenci-room').emit('yeni-bildirim', bildirim);
  }
  res.status(201).json({ success: true, message: 'Bildirim gonderildi.', bildirim });
};

const sifreDegistir = (req, res) => {
  const { eski_sifre, yeni_sifre } = req.body;
  if (!eski_sifre || !yeni_sifre || yeni_sifre.length < 6)
    return res.status(400).json({ success: false, message: 'Eski sifre ve en az 6 karakterli yeni sifre gerekli.' });
  const admin = dbGet('SELECT * FROM yoneticiler WHERE id = ?', [req.admin.id]);
  if (!admin) return res.status(404).json({ success: false, message: 'Yonetici bulunamadi.' });
  if (!bcrypt.compareSync(eski_sifre, admin.sifre_hash))
    return res.status(401).json({ success: false, message: 'Eski sifre hatali.' });
  dbRun('UPDATE yoneticiler SET sifre_hash = ? WHERE id = ?', [bcrypt.hashSync(yeni_sifre, 12), req.admin.id]);
  res.json({ success: true, message: 'Sifre basariyla guncellendi.' });
};

// Guvenlikci barkod okuma - token gerektirmez, sadece barkod alir
const guvenlikciOku = (req, res) => {
  const { barkod_veri } = req.body;
  if (!barkod_veri) return res.status(400).json({ success: false, message: 'Barkod gerekli.' });

  const ogrenci = dbGet('SELECT id, ogrenci_no, ad_soyad, sinif, durum FROM ogrenciler WHERE barkod_veri = ?', [barkod_veri.trim()]);
  if (!ogrenci) return res.status(404).json({ success: false, message: 'Ogrenci bulunamadi.' });

  const normalizedIslem = ogrenci.durum === 'DISARIDA' ? 'GİRİŞ' : 'ÇIKIŞ';
  const yeniDurum = normalizedIslem === 'GİRİŞ' ? 'OKULDA' : 'DISARIDA';

  dbRun('UPDATE ogrenciler SET durum = ? WHERE id = ?', [yeniDurum, ogrenci.id]);
  dbRun('INSERT INTO loglar (ogrenci_id, islem_turu) VALUES (?, ?)', [ogrenci.id, normalizedIslem]);

  const sonLog = dbGet('SELECT * FROM loglar WHERE ogrenci_id = ? ORDER BY id DESC LIMIT 1', [ogrenci.id]);

  if (req.app.get('io')) {
    req.app.get('io').to('admin-room').emit('yeni-islem', {
      ogrenci_id: ogrenci.id, ad_soyad: ogrenci.ad_soyad,
      ogrenci_no: ogrenci.ogrenci_no, sinif: ogrenci.sinif,
      islem_turu: normalizedIslem, tarih_saat: sonLog.tarih_saat, yeni_durum: yeniDurum,
    });
  }

  res.json({
    success: true,
    islem_turu: normalizedIslem,
    ogrenci: { ad_soyad: ogrenci.ad_soyad, ogrenci_no: ogrenci.ogrenci_no, sinif: ogrenci.sinif, durum: yeniDurum },
    saat: sonLog.tarih_saat,
  });
};

module.exports = { ogrenciEkle, ogrenciGuncelle, ogrenciSil, ogrenciListesi, getLoglari, getDashboard, bildirimGonder, sifreDegistir, guvenlikciOku };

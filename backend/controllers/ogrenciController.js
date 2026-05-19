const { dbGet, dbQuery, dbRun, dbTransaction } = require('../config/database');

const getProfil = (req, res) => {
  const ogrenci = dbGet(
    'SELECT id, ogrenci_no, ad_soyad, durum, barkod_veri, olusturma_tarihi FROM ogrenciler WHERE id = ?',
    [req.ogrenci.id]
  );
  if (!ogrenci) return res.status(404).json({ success: false, message: 'Ogrenci bulunamadi.' });
  res.json({ success: true, ogrenci });
};

const islemYap = (req, res) => {
  const { barkod_veri, islem_turu } = req.body;
  if (!barkod_veri || !islem_turu)
    return res.status(400).json({ success: false, message: 'Barkod ve islem turu gerekli.' });

  const normalizedIslem = islem_turu.toUpperCase();
  if (!['GİRİŞ', 'ÇIKIŞ'].includes(normalizedIslem))
    return res.status(400).json({ success: false, message: 'Islem turu GİRİŞ veya ÇIKIŞ olmali.' });

  const ogrenci = dbGet('SELECT * FROM ogrenciler WHERE id = ? AND barkod_veri = ?', [req.ogrenci.id, barkod_veri.trim()]);
  if (!ogrenci)
    return res.status(403).json({ success: false, message: 'Barkod eslesemdi. Kendi barkodunuzu kullanin.' });

  if (normalizedIslem === 'GİRİŞ' && ogrenci.durum === 'OKULDA')
    return res.status(400).json({ success: false, message: 'Zaten okuldaki kayitlisiniz.' });
  if (normalizedIslem === 'ÇIKIŞ' && ogrenci.durum === 'DISARIDA')
    return res.status(400).json({ success: false, message: 'Zaten disarida kayitlisiniz.' });

  const yeniDurum = normalizedIslem === 'GİRİŞ' ? 'OKULDA' : 'DISARIDA';

  dbTransaction(() => {
    dbRun('UPDATE ogrenciler SET durum = ? WHERE id = ?', [yeniDurum, ogrenci.id]);
    dbRun('INSERT INTO loglar (ogrenci_id, islem_turu) VALUES (?, ?)', [ogrenci.id, normalizedIslem]);
  });

  const sonLog = dbGet('SELECT * FROM loglar WHERE ogrenci_id = ? ORDER BY id DESC LIMIT 1', [ogrenci.id]);

  if (req.app.get('io')) {
    req.app.get('io').to('admin-room').emit('yeni-islem', {
      ogrenci_id: ogrenci.id,
      ad_soyad: ogrenci.ad_soyad,
      ogrenci_no: ogrenci.ogrenci_no,
      islem_turu: normalizedIslem,
      tarih_saat: sonLog.tarih_saat,
      yeni_durum: yeniDurum,
    });
  }

  res.json({
    success: true,
    message: normalizedIslem === 'GİRİŞ' ? 'Okula giris basariyla kaydedildi.' : 'Okuldan cikis basariyla kaydedildi.',
    saat: sonLog.tarih_saat,
    durum: yeniDurum,
  });
};

const getGecmis = (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const filtre = req.query.filtre;

  let sql = 'SELECT * FROM loglar WHERE ogrenci_id = ?';
  const params = [req.ogrenci.id];

  if (filtre && ['GİRİŞ', 'ÇIKIŞ'].includes(filtre.toUpperCase())) {
    sql += ' AND islem_turu = ?';
    params.push(filtre.toUpperCase());
  }
  sql += ' ORDER BY id DESC LIMIT ?';
  params.push(limit);

  const loglar = dbQuery(sql, params);
  res.json({ success: true, loglar });
};

const getBildirimler = (req, res) => {
  const bildirimler = dbQuery(
    'SELECT * FROM bildirimler WHERE hedef_ogrenci_id IS NULL OR hedef_ogrenci_id = ? ORDER BY id DESC LIMIT 50',
    [req.ogrenci.id]
  );

  const ogrenciId = String(req.ogrenci.id);
  const isaret = bildirimler.map(b => {
    let liste = [];
    try { liste = JSON.parse(b.okundu_ogrenci_ids || '[]'); } catch {}
    return { ...b, okundu: liste.includes(ogrenciId) };
  });

  res.json({ success: true, bildirimler: isaret });
};

const bildirimOku = (req, res) => {
  const { id } = req.params;
  const ogrenciId = String(req.ogrenci.id);

  const bildirim = dbGet('SELECT * FROM bildirimler WHERE id = ?', [id]);
  if (!bildirim) return res.status(404).json({ success: false, message: 'Bildirim bulunamadi.' });

  let liste = [];
  try { liste = JSON.parse(bildirim.okundu_ogrenci_ids || '[]'); } catch {}
  if (!liste.includes(ogrenciId)) {
    liste.push(ogrenciId);
    dbRun('UPDATE bildirimler SET okundu_ogrenci_ids = ? WHERE id = ?', [JSON.stringify(liste), id]);
  }

  res.json({ success: true, message: 'Okundu isaretlendi.' });
};

module.exports = { getProfil, islemYap, getGecmis, getBildirimler, bildirimOku };

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'database.db');

let db = null;

function saveDb() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

let saveTimer = null;
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveDb(), 300);
}

function getDb() { return db; }

async function initDb() {
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('Mevcut veritabani yuklendi.');
  } else {
    db = new SQL.Database();
    console.log('Yeni veritabani olusturuldu.');
  }

  db.run('PRAGMA foreign_keys = ON;');

  db.run(`CREATE TABLE IF NOT EXISTS yoneticiler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kullanici_adi TEXT UNIQUE NOT NULL,
    sifre_hash TEXT NOT NULL,
    olusturma_tarihi TEXT DEFAULT (datetime('now', 'localtime'))
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS ogrenciler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ogrenci_no TEXT UNIQUE NOT NULL,
    ad_soyad TEXT NOT NULL,
    sinif TEXT DEFAULT '',
    sifre_hash TEXT NOT NULL,
    barkod_veri TEXT UNIQUE NOT NULL,
    durum TEXT DEFAULT 'DISARIDA',
    olusturma_tarihi TEXT DEFAULT (datetime('now', 'localtime'))
  );`);

  // Sinif kolonu yoksa ekle (guncelleme icin)
  try { db.run('ALTER TABLE ogrenciler ADD COLUMN sinif TEXT DEFAULT "";'); } catch(e) {}

  db.run(`CREATE TABLE IF NOT EXISTS loglar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ogrenci_id INTEGER NOT NULL,
    islem_turu TEXT NOT NULL,
    tarih_saat TEXT DEFAULT (datetime('now', 'localtime'))
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS bildirimler (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    baslik TEXT NOT NULL,
    icerik TEXT NOT NULL,
    hedef_ogrenci_id INTEGER DEFAULT NULL,
    okundu_ogrenci_ids TEXT DEFAULT '[]',
    tarih_saat TEXT DEFAULT (datetime('now', 'localtime'))
  );`);

  db.run(`CREATE INDEX IF NOT EXISTS idx_loglar_ogrenci ON loglar(ogrenci_id);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_ogrenciler_barkod ON ogrenciler(barkod_veri);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_ogrenciler_no ON ogrenciler(ogrenci_no);`);

  const adminRows = dbQuery('SELECT id FROM yoneticiler WHERE kullanici_adi = ?', ['admin']);
  if (!adminRows.length) {
    const hash = bcrypt.hashSync(process.env.ADMIN_DEFAULT_PASS || 'Admin2026!', 12);
    dbRun('INSERT INTO yoneticiler (kullanici_adi, sifre_hash) VALUES (?, ?)', ['admin', hash]);
    console.log('Admin olusturuldu: admin / Admin2026!');
  }

  const demoRows = dbQuery('SELECT id FROM ogrenciler WHERE ogrenci_no = ?', ['2026001']);
  if (!demoRows.length) {
    const demoPass = bcrypt.hashSync('123456', 10);
    const students = [
      ['2026001', 'Ahmet Yilmaz', '10-A', demoPass, 'OKL-2026-0001'],
      ['2026002', 'Fatma Kaya',   '9-B',  demoPass, 'OKL-2026-0002'],
      ['2026003', 'Mehmet Demir', '11-C', demoPass, 'OKL-2026-0003'],
    ];
    students.forEach(s => {
      dbRun('INSERT INTO ogrenciler (ogrenci_no, ad_soyad, sinif, sifre_hash, barkod_veri) VALUES (?, ?, ?, ?, ?)', s);
    });
    console.log('Demo ogrenciler olusturuldu (sifre: 123456)');
  }

  saveDb();
  console.log('Veritabani hazir:', DB_PATH);
  return db;
}

function dbQuery(sql, params) {
  if (!params) params = [];
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function dbGet(sql, params) {
  const rows = dbQuery(sql, params || []);
  return rows.length ? rows[0] : null;
}

function dbRun(sql, params) {
  if (!params) params = [];
  db.run(sql, params);
  const lastId = dbGet('SELECT last_insert_rowid() as id', []);
  const changes = db.getRowsModified();
  scheduleSave();
  return { lastInsertRowid: lastId ? lastId.id : null, changes };
}

function dbTransaction(fn) {
  db.run('BEGIN');
  try { fn(); db.run('COMMIT'); scheduleSave(); }
  catch(e) { db.run('ROLLBACK'); throw e; }
}

module.exports = { getDb, initDb, dbQuery, dbGet, dbRun, dbTransaction, saveDb };

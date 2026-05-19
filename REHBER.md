# 📘 OkulGiriş — Kurulum ve Kullanım Rehberi

## İçindekiler
1. [Gereksinimler](#1-gereksinimler)
2. [Kurulum](#2-kurulum)
3. [Uygulamayı Başlatma](#3-uygulamayı-başlatma)
4. [Admin Paneli](#4-admin-paneli)
5. [Öğrenci Arayüzü (PWA)](#5-öğrenci-arayüzü-pwa)
6. [Demo Hesaplar](#6-demo-hesaplar)
7. [API Referansı](#7-api-referansı)
8. [Güvenlik Notları](#8-güvenlik-notları)
9. [Sık Karşılaşılan Sorunlar](#9-sık-karşılaşılan-sorunlar)

---

## 1. Gereksinimler

| Gereksinim | Minimum Versiyon | Kontrol |
|---|---|---|
| Node.js | 18.0+ | `node --version` |
| npm | 9.0+ | `npm --version` |
| Modern tarayıcı | Chrome/Edge/Firefox/Safari son sürüm | — |

> **Not:** Kamera işlevi için HTTPS zorunludur. Yerel test için `localhost` üzerinden çalışmak yeterlidir; kameraya erişim sağlar.

---

## 2. Kurulum

### Windows
```
1. Bu klasörü bir konuma çıkarın (örn: C:\OkulGiris)
2. install.bat dosyasına çift tıklayın
3. Yükleme tamamlandıktan sonra devam edin
```

### Linux / macOS
```bash
# Terminalde proje klasörüne gidin
cd okulgiris-project

# Scripte çalıştırma izni ver
chmod +x install.sh start.sh

# Kurulumu başlat
./install.sh
```

### Manuel Kurulum
```bash
cd okulgiris-project/backend
npm install
```

---

## 3. Uygulamayı Başlatma

### Windows
```
start.bat dosyasına çift tıklayın
```

### Linux / macOS
```bash
./start.sh
```

### Manuel
```bash
cd backend
node server.js
```

Başarılı başlatmada terminalde şunu görürsünüz:
```
════════════════════════════════════════
  🏫 OkulGiriş Sistemi Başlatıldı!
════════════════════════════════════════
  📱 Öğrenci Arayüzü : http://localhost:3001/student/index.html
  🖥️  Admin Paneli     : http://localhost:3001/admin/index.html
  🔌 API              : http://localhost:3001/api
════════════════════════════════════════
  Admin Giriş: admin / Admin2026!
  Demo Öğrenci: 2026001 / 123456
════════════════════════════════════════
```

---

## 4. Admin Paneli

### Erişim
Tarayıcıda açın: **http://localhost:3001/admin/index.html**

### Varsayılan Giriş Bilgileri
| Alan | Değer |
|---|---|
| Kullanıcı Adı | `admin` |
| Şifre | `Admin2026!` |

> ⚠️ **Üretime geçmeden önce şifreyi mutlaka değiştirin!** (Ayarlar menüsünden yapılabilir.)

---

### 4.1 Dashboard
- Anlık okulda/dışarıda öğrenci sayısı
- Bugün yapılan giriş sayısı
- Son 10 giriş-çıkış işlemi

---

### 4.2 Öğrenci Yönetimi

#### Yeni Öğrenci Ekleme
1. Sol menüden **Öğrenci Yönetimi**'ni seçin
2. Sağ üstte **Öğrenci Ekle** butonuna tıklayın
3. Formu doldurun:
   - **Öğrenci No**: Benzersiz numara (örn: 2026001)
   - **Ad Soyad**: Öğrencinin tam adı
   - **Şifre**: En az 4 karakter (öğrenci mobil girişte kullanacak)
   - **Barkod**: Öğrenci no girilince otomatik oluşur (OKL-YYYY-XXXX formatında)
4. **Kaydet**'e tıklayın

#### Barkod/QR Görüntüleme ve Yazdırma
1. Öğrenci listesinde ilgili satırın yanındaki **QR ikonu**na tıklayın
2. Açılan pencerede QR kod görünür
3. **Yazdır** butonuyla baskı alabilirsiniz

#### Öğrenci Düzenleme
- Kalem ikonuna tıklayarak ad-soyad veya şifre güncellenebilir
- Öğrenci no değiştirilemez (barkodla bağlantılı)

#### Öğrenci Silme
- Çöp kutusu ikonuna tıklayın
- Onay penceresi çıkar, **Evet, Sil**'e basın
- ⚠️ Silme işlemi tüm giriş-çıkış kayıtlarını da siler (CASCADE)

---

### 4.3 Canlı Takip
- Sol menüden **Canlı Takip**'e tıklayın
- Sayfa yenilemeye gerek yok — WebSocket ile anlık güncellenir
- Her giriş/çıkışta öğrenci bilgisi ve saat görünür
- **Temizle** butonu ekranı sıfırlar

---

### 4.4 Tüm Loglar
- Tüm giriş-çıkış geçmişini listeler
- Filtre ile sadece Girişler veya Çıkışlar görüntülenebilir
- **Yenile** butonu ile veri tazelenir

---

### 4.5 Bildirim Merkezi
1. **Başlık** ve **İçerik** alanlarını doldurun
2. Gönderim türünü seçin:
   - **Tüm Okul (Genel)**: Tüm öğrencilere gider
   - **Özel Öğrenci**: Dropdown'dan belirli bir öğrenci seçilir
3. **Gönder** butonuna basın
4. Öğrenciler anlık olarak bildirimi alır (WebSocket)

---

### 4.6 Ayarlar (Şifre Değiştir)
1. Sol menü altında **Ayarlar**'a tıklayın
2. Mevcut şifreyi, yeni şifreyi (2 kez) girin
3. **Şifreyi Güncelle**'ye tıklayın

---

## 5. Öğrenci Arayüzü (PWA)

### Erişim
Öğrenci cihazında tarayıcıda açın: **http://[SUNUCU_IP]:3001/student/index.html**

> Örnek: Sunucu IP'si `192.168.1.100` ise → `http://192.168.1.100:3001/student/index.html`

---

### 5.1 PWA Olarak Yükleme (Opsiyonel)
**Android (Chrome):**
1. Sayfayı açın
2. Sağ üstte ⋮ (üç nokta) menüsüne tıklayın
3. **"Ana Ekrana Ekle"** seçeneğini seçin
4. Uygulama artık ana ekranda ikon olarak görünür

**iOS (Safari):**
1. Sayfayı Safari'de açın
2. Alt ortada paylaşma ikonuna (□↑) tıklayın
3. **"Ana Ekrana Ekle"** seçeneğini seçin

---

### 5.2 Giriş Yapma
1. **Öğrenci Numarası** alanına numarayı girin
2. **Şifre** alanına şifreyi girin (göz ikonu ile göster/gizle)
3. **Giriş Yap** butonuna basın

---

### 5.3 Barkod ile Giriş/Çıkış Yapma
1. Giriş sonrası Ana Sayfa ekranı açılır
2. Kamera vizörünün altındaki butonlara basın:
   - **🟢 Giriş Yap** — Okula giriş kaydı
   - **🔴 Çıkış Yap** — Okuldan çıkış kaydı
3. Kamera aktif hale gelir
4. **Kendi barkod kartınızı** kameraya tutun (QR kod)
5. Başarılı okumada ekranda onay mesajı görünür
6. Aynı butona tekrar basarak kamerayı kapatabilirsiniz

> **Önemli:** Öğrenci sadece kendi barkodunu okutabilir. Başkasının barkodunu okutmaya çalışırsa "Barkod eşleşmedi" hatası alır.

---

### 5.4 Duyurular
- Ana sayfada aşağı kaydırınca duyurular görünür
- Okunmamış duyurular kırmızı nokta ile işaretlenir
- Duyuruya tıklayınca okundu işaretlenir

---

### 5.5 Geçmiş İşlemler
- Alt menüde **Geçmiş** ikonuna tıklayın
- Tüm giriş-çıkış geçmişi kronolojik görünür
- **Tümü / Girişler / Çıkışlar** filtreleri kullanılabilir

---

## 6. Demo Hesaplar

### Admin
| Kullanıcı Adı | Şifre |
|---|---|
| `admin` | `Admin2026!` |

### Demo Öğrenciler (Şifre hepsi: `123456`)
| Öğrenci No | Ad Soyad | Barkod |
|---|---|---|
| `2026001` | Ahmet Yılmaz | `OKL-2026-0001` |
| `2026002` | Fatma Kaya | `OKL-2026-0002` |
| `2026003` | Mehmet Demir | `OKL-2026-0003` |

---

## 7. API Referansı

Tüm istekler `Content-Type: application/json` ile gönderilmelidir.

### Kimlik Doğrulama

| Yöntem | Endpoint | Açıklama |
|---|---|---|
| POST | `/api/auth/ogrenci-login` | Öğrenci girişi |
| POST | `/api/auth/admin-login` | Admin girişi |

### Öğrenci (JWT Token Gerekli)

| Yöntem | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/ogrenci/profil` | Profil bilgisi |
| POST | `/api/ogrenci/islem-yap` | Giriş/Çıkış yap |
| GET | `/api/ogrenci/gecmis` | Log geçmişi |
| GET | `/api/ogrenci/bildirimler` | Bildirimler |
| POST | `/api/ogrenci/bildirimler/:id/oku` | Okundu işaretle |

### Admin (Admin JWT Token Gerekli)

| Yöntem | Endpoint | Açıklama |
|---|---|---|
| GET | `/api/admin/dashboard` | İstatistikler |
| POST | `/api/admin/ogrenci-ekle` | Öğrenci ekle |
| GET | `/api/admin/ogrenciler` | Öğrenci listesi |
| PUT | `/api/admin/ogrenciler/:id` | Öğrenci güncelle |
| DELETE | `/api/admin/ogrenciler/:id` | Öğrenci sil |
| GET | `/api/admin/loglar` | Tüm loglar |
| POST | `/api/admin/bildirim-gonder` | Bildirim gönder |
| POST | `/api/admin/sifre-degistir` | Admin şifre değiştir |

---

## 8. Güvenlik Notları

### Üretim Ortamı İçin Yapılması Gerekenler

1. **`.env` dosyasını düzenleyin:**
   ```
   JWT_SECRET=<en az 64 karakterlik rastgele string>
   ADMIN_DEFAULT_PASS=<güçlü şifre>
   NODE_ENV=production
   ```

2. **JWT Secret üretimi:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **HTTPS zorunlu:** Kamera erişimi için SSL sertifikası gerekir.
   - Ücretsiz: Let's Encrypt + Nginx reverse proxy
   - Yerel test: `localhost` HTTP'de kamera açar

4. **Firewall:** 3001 portunu yalnızca yerel ağa açın

5. **Veritabanı yedekleme:** `database.db` dosyasını düzenli yedekleyin

---

## 9. Sık Karşılaşılan Sorunlar

### "Kamera açılmıyor"
- Çözüm: Site mutlaka `https://` veya `http://localhost` üzerinden açılmalı
- HTTP + IP adresi kombinasyonu kamerayı engeller

### "Sunucuya bağlanılamadı"
- `node server.js` komutunun çalıştığını kontrol edin
- Firewall'un 3001 portunu engellemediğinden emin olun
- Öğrenci cihazının sunucu ile aynı ağda olduğunu kontrol edin

### "Token süresi doldu"
- Öğrenci 8 saat sonra otomatik çıkış yapar
- Tekrar giriş yapması yeterlidir

### "SQLITE_BUSY hatası"
- Çok yoğun eş zamanlı yazma durumunda olabilir
- `database.js` içindeki `timeout: 10000` değerini artırın

### Port değiştirme
- `.env` dosyasında `PORT=3001` satırını değiştirin

---

## Klasör Yapısı

```
okulgiris-project/
├── backend/
│   ├── config/
│   │   └── database.js       # DB init, bağlantı
│   ├── controllers/
│   │   ├── authController.js # Giriş işlemleri
│   │   ├── ogrenciController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js           # JWT doğrulama
│   ├── routes/
│   │   ├── auth.js
│   │   ├── ogrenci.js
│   │   └── admin.js
│   ├── .env                  # Çevre değişkenleri
│   ├── database.db           # SQLite (ilk çalıştırmada oluşur)
│   ├── package.json
│   └── server.js             # Ana giriş noktası
├── frontend-student/
│   └── public/
│       ├── index.html        # Öğrenci PWA (tek dosya uygulama)
│       ├── manifest.json     # PWA manifest
│       ├── sw.js             # Service Worker
│       └── offline.html      # Çevrimdışı sayfası
├── frontend-admin/
│   └── public/
│       └── index.html        # Admin paneli (tek dosya)
├── install.bat               # Windows kurulum
├── install.sh                # Linux/Mac kurulum
├── start.bat                 # Windows başlatma
├── start.sh                  # Linux/Mac başlatma
└── REHBER.md                 # Bu dosya
```

---

*OkulGiriş v1.0 — Barkodlu Öğrenci Takip ve Bildirim Sistemi*

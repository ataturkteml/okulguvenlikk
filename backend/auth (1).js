const jwt = require('jsonwebtoken');

const authOgrenci = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token gerekli.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.rol !== 'ogrenci') {
      return res.status(403).json({ success: false, message: 'Yetkisiz erişim.' });
    }
    req.ogrenci = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });
  }
};

const authAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token gerekli.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.rol !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin yetkisi gerekli.' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Geçersiz veya süresi dolmuş token.' });
  }
};

module.exports = { authOgrenci, authAdmin };

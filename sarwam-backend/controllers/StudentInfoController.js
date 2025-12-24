import jwt from 'jsonwebtoken';

export const getInfo = async (req, res) => {
  try {
    const auth = req.headers?.authorization ;
    if (!auth) return res.status(401).json({ error: 'Authorization token required' });

    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
    if (!token) return res.status(401).json({ error: 'Token missing' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // return token payload. Replace with DB lookup if you want full student record:
    return res.status(200).json({ success: true, user: payload });
  } catch (err) {
    console.error('getInfo error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
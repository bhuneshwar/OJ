const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token; // Get token from cookies

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            
            // Find user and attach to request
            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            }

            // Attach user object to request
            req.user = user;
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expired' });
            }
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

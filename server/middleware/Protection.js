import jwt from 'jsonwebtoken';
import User from '../Models/UserModels.js';

const protection = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.RefreshToken;

        if (!refreshToken) {
            return next({
                message: "no tokens provided",
                status: 401
            })
        }

        const decoded = jwt.verify(refreshToken, process.env.secretToken);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
};

export { protection };

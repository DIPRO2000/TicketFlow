import jwt from 'jsonwebtoken';

export const authOrganizerMiddleware = (req,res,next) => {
    const token = req.cookies.organizer_token;

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    console.log("Token from cookie:", token);

    try {
        const decoded = jwt.verify(token, process.env.ORGANIZER_JWT_SECRET);
        req.user = decoded;
        next();
    } 
    catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
}
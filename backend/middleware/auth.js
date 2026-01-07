import jwt from "jsonwebtoken";

export const verifyToken = async(req,res,next) => {

    const authHeader=req.headers["authorization"];
    const token=authHeader && authHeader.split(" ")[1];

    if(!token)
    {
        return res.status(401).json({ message: "No Token Provided " });
    }

    jwt.verify(token , process.env.ORGANIZER_JWT_SECRET , (err,decoded) =>{
        if(err)
        {
            return res.status(403).json({ message: "Not Authorized " });
        }
        else
        {
            next();
        }
    });
    
}

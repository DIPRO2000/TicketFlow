import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary config (better to keep in env variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// (async () => {
//   try {
//     const res = await cloudinary.api.ping();
//     console.log("Cloudinary works:", res);
//   } catch (err) {
//     console.error("Cloudinary error:", err);
//   }
// })();

export default cloudinary;
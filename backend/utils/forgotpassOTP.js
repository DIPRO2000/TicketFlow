import nodemailer from "nodemailer";

export async function forgotpassOTP(email, otp)
{
    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.SENDER_EMAIL,
            pass:process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"Ticketrise" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP for changing password of Ticketrise Account",
        text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
    });
}
import nodemailer from "nodemailer";

export async function sendForgotPasswordEmail(email,password)
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
        subject: "Password Retrival for Ticketrise Account",
        text: `Your Password is: ${password}.Please change the password for security purpose.Have a Good Day.`,
    });
}
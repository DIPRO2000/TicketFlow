import nodemailer from "nodemailer";

export async function sendToken(email, token, eventName)
{
    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.SENDER_EMAIL, 
            pass:process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"Ticketrise-Event:${eventName}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your Token of Registration for Event:${eventName}`,
        text: `Your Token is: ${token}. Show this for checking in on the day of the event.`,
    });
}
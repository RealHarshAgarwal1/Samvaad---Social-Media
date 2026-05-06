import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendVerificationEmail = async (email, token) => {
    try {
        // Create a mock default transport if no real SMTP exists. 
        // For production, the user will configure process.env.SMTP_USER, etc.
        let transporter;
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail', // or host
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                connectionTimeout: 10000, // 10 seconds timeout for connection
            });
        } else {
            console.error("CRITICAL: SMTP_USER and SMTP_PASS are not set in environment variables!");
            return false;
        }

        const frontendUrl = process.env.URL || 'http://localhost:5173';
        const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

        const mailOptions = {
            from: '"Samvaad App" <no-reply@samvaad.com>',
            to: email,
            subject: 'Verify your email address - Samvaad',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to Samvaad!</h2>
                    <p>Please verify your email address by clicking the link below:</p>
                    <a href="${verifyLink}" style="display:inline-block; padding: 10px 20px; background-color: #0095F6; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                    <p>Or paste this link in your browser: <br> ${verifyLink}</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log(`\n================================`);
        console.log(`✉️ EMAIL SENT TO: ${email}`);
        console.log(`🔗 VERIFICATION LINK: ${verifyLink}`);
        if(!process.env.SMTP_USER) {
            console.log(`🌐 Preview Email: ${nodemailer.getTestMessageUrl(info)}`);
        }
        console.log(`================================\n`);

        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

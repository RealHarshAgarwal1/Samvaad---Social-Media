import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendVerificationEmail = async (email, token) => {
    try {
        // Create a mock default transport if no real SMTP exists. 
        // For production, the user will configure process.env.SMTP_USER, etc.
        let transporter;
        
        console.log(`[EMAIL DEBUG] SMTP_USER: ${process.env.SMTP_USER ? '✓ SET' : '✗ NOT SET'}`);
        console.log(`[EMAIL DEBUG] SMTP_PASS: ${process.env.SMTP_PASS ? '✓ SET' : '✗ NOT SET'}`);
        console.log(`[EMAIL DEBUG] NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
        
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            console.log('[EMAIL DEBUG] Transporter created successfully');
        } else {
            console.error("CRITICAL: SMTP_USER and SMTP_PASS are not set in environment variables!");
            console.error(`SMTP_USER = ${process.env.SMTP_USER}`);
            console.error(`SMTP_PASS = ${process.env.SMTP_PASS}`);
            return false;
        }

        const frontendUrl = process.env.URL || 'http://localhost:5173';
        const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

        const mailOptions = {
            from: process.env.SMTP_USER,
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

        console.log(`[EMAIL DEBUG] Attempting to send email to: ${email}`);
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`\n================================`);
        console.log(`✉️ EMAIL SENT TO: ${email}`);
        console.log(`🔗 VERIFICATION LINK: ${verifyLink}`);
        console.log(`📧 Response ID: ${info.response}`);
        if(!process.env.SMTP_USER) {
            console.log(`🌐 Preview Email: ${nodemailer.getTestMessageUrl(info)}`);
        }
        console.log(`================================\n`);

        return true;
    } catch (error) {
        console.error('❌ EMAIL SENDING FAILED');
        console.error(`Error Code: ${error.code}`);
        console.error(`Error Message: ${error.message}`);
        console.error(`Full Error:`, error);
        return false;
    }
};

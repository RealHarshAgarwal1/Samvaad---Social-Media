import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendVerificationEmail = async (email, token) => {
    try {
        let transporter;

        // Check SMTP credentials
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {

            transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                family: 4, // Force IPv4 for Render

                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },

                // Prevent API from hanging forever
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 10000,

                tls: {
                    rejectUnauthorized: false,
                },
            });

            // Verify SMTP connection
            await transporter.verify();
            console.log('✅ SMTP connected successfully');

        } else {
            console.error('CRITICAL: SMTP_USER and SMTP_PASS are not set!');
            return false;
        }

        // Frontend URL
        const frontendUrl = process.env.URL || 'http://localhost:5173';

        // Verification link
        const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

        // Email options
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Verify your email address - Samvaad',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to Samvaad!</h2>

                    <p>
                        Please verify your email address by clicking the button below:
                    </p>

                    <a 
                        href="${verifyLink}" 
                        style="
                            display:inline-block;
                            padding: 10px 20px;
                            background-color: #0095F6;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                        "
                    >
                        Verify Email
                    </a>

                    <p style="margin-top:20px;">
                        Or paste this link in your browser:
                    </p>

                    <p>${verifyLink}</p>
                </div>
            `,
        };

        console.log(`📧 Sending email to: ${email}`);

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('\n================================');
        console.log(`✉️ EMAIL SENT TO: ${email}`);
        console.log(`🔗 VERIFICATION LINK: ${verifyLink}`);
        console.log(`📨 RESPONSE: ${info.response}`);
        console.log('================================\n');

        return true;

    } catch (error) {

        console.error('❌ EMAIL SENDING FAILED');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('Full Error:', error);

        return false;
    }
};
const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Create transporter (configure with your email provider properties)
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // or your provider
            auth: {
                user: process.env.EMAIL_USER || 'demo@example.com',
                pass: process.env.EMAIL_PASS || 'demo_pass'
            }
        });

        // Check if real config is present
        this.isMock = !process.env.EMAIL_USER;
    }

    async sendTripReceipt(user, trip) {
        if (this.isMock) {
            console.log('📧 [MOCK EMAIL] Sending Trip Receipt to:', user.email || user.userId);
            console.log(`   Subject: Trip Completed - Fare Deducted: ₹${trip.fareAmount}`);
            console.log(`   Body: Journey from ${trip.pickupLocation.name} to ${trip.dropLocation.name} completed.`);
            return true;
        }

        const mailOptions = {
            from: '"SmartBus Wallet" <noreply@smartbus.com>',
            to: user.email,
            subject: '🚌 Trip Receipt - SmartBus',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px;">
                    <h2 style="color: #2563eb;">Trip Completed</h2>
                    <p>Dear ${user.name},</p>
                    <p>Your journey has been successfully completed and fare has been deducted.</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Pickup</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${trip.pickupLocation.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Drop</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${trip.dropLocation.name}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Distance</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${trip.distanceKm.toFixed(2)} km</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Fare Deducted</strong></td>
                            <td style="padding: 10px; border: 1px solid #ddd; color: #dc2626;"><strong>₹${trip.fareAmount}</strong></td>
                        </tr>
                    </table>
                    
                    <p>Current Wallet Balance: <strong>₹${user.balance}</strong></p>
                    <p style="font-size: 12px; color: #666;">Thank you for using SmartBus!</p>
                </div>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Email send failed:', error);
            return false;
        }
    }
}

module.exports = new EmailService();

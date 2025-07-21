// src/services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Create email transporter
   */
  createTransporter() {
    // Configure based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production email service (e.g., SendGrid, AWS SES)
      return nodemailer.createTransporter({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      // Development - use Ethereal Email or log to console
      return nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user@ethereal.email',
          pass: 'ethereal.pass'
        }
      });
    }
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@boxinator.com',
      to: email,
      subject: 'Verify Your Email - Boxinator',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Boxinator!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, token, userName) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@boxinator.com',
      to: email,
      subject: 'Password Reset - Boxinator',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>You requested to reset your password. Click the link below to create a new password:</p>
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
          <p>Or copy and paste this link in your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send shipment status notification
   */
  async sendShipmentStatusEmail(email, shipment, newStatus) {
    const trackingUrl = `${process.env.FRONTEND_URL}/track/${shipment.id}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@boxinator.com',
      to: email,
      subject: `Shipment Update - ${newStatus} - Boxinator`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Shipment Status Update</h2>
          <p>Your shipment status has been updated:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Shipment ID:</strong> ${shipment.id}</p>
            <p><strong>Status:</strong> ${newStatus}</p>
            <p><strong>Destination:</strong> ${shipment.destinationCountry}</p>
            <p><strong>Receiver:</strong> ${shipment.receiverName}</p>
          </div>
          <a href="${trackingUrl}" 
             style="background-color: #28a745; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Track Shipment
          </a>
          <p>Thank you for using Boxinator!</p>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Shipment status email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send shipment status email:', error);
      throw new Error('Failed to send shipment status email');
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, userName) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@boxinator.com',
      to: email,
      subject: 'Welcome to Boxinator!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Boxinator, ${userName}!</h2>
          <p>Your email has been verified and your account is now active.</p>
          <p>You can now:</p>
          <ul>
            <li>Create and track shipments</li>
            <li>Manage your account</li>
            <li>View shipment history</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #007bff; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
          <p>Thank you for choosing Boxinator!</p>
        </div>
      `
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }
}

// Export singleton instance
module.exports = new EmailService();

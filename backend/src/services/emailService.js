import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

/**
 * Send OTP verification email
 * @param {string} email
 * @param {string} otpCode
 * @param {string} userName
 */
export async function sendOtpEmail(email, otpCode, userName) {
  try {
    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: 'Verify Your Email - Stayy',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #000; text-align: center; margin-bottom: 20px;">Verify Your Email</h1>
            <p style="color: #555; font-size: 16px; margin-bottom: 10px;">Hi ${userName},</p>
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              Welcome to Stayy! Use the verification code below to complete your signup.
            </p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <p style="font-size: 32px; font-weight: bold; color: #000; margin: 0; letter-spacing: 5px;">
                ${otpCode}
              </p>
            </div>
            <p style="color: #555; font-size: 14px; margin-top: 20px;">
              This code expires in 10 minutes. Do not share this code with anyone.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send listing created notification to host
 * @param {string} hostEmail
 * @param {string} hostName
 * @param {string} listingTitle
 * @param {string} listingCity
 */
export async function sendListingCreatedEmail(hostEmail, hostName, listingTitle, listingCity) {
  try {
    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: hostEmail,
      subject: 'Your Listing is Live - Stayy',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #000; text-align: center; margin-bottom: 20px;">🎉 Listing Published!</h1>
            <p style="color: #555; font-size: 16px; margin-bottom: 10px;">Hi ${hostName},</p>
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              Great news! Your listing has been successfully created and is now live on Stayy.
            </p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Listing:</strong> ${listingTitle}
              </p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                <strong>Location:</strong> ${listingCity}
              </p>
            </div>
            <p style="color: #555; font-size: 14px; margin-top: 20px;">
              Your listing is now visible to guests. Start receiving bookings and earning revenue!
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
              © Stayy. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Failed to send listing created email:', error);
    throw new Error('Failed to send listing notification');
  }
}

/**
 * Send booking confirmation email to host
 * @param {string} hostEmail
 * @param {string} hostName
 * @param {string} guestName
 * @param {string} listingTitle
 * @param {string} checkInDate
 * @param {string} checkOutDate
 * @param {number} totalPrice
 */
export async function sendBookingConfirmationHostEmail(
  hostEmail,
  hostName,
  guestName,
  listingTitle,
  checkInDate,
  checkOutDate,
  totalPrice
) {
  try {
    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: hostEmail,
      subject: 'New Booking Confirmation - Stayy',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #000; text-align: center; margin-bottom: 20px;">✓ Booking Confirmed</h1>
            <p style="color: #555; font-size: 16px; margin-bottom: 10px;">Hi ${hostName},</p>
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              You have a new booking! Here are the details:
            </p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Guest:</strong> ${guestName}
              </p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                <strong>Property:</strong> ${listingTitle}
              </p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                <strong>Check-in:</strong> ${checkInDate}
              </p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                <strong>Check-out:</strong> ${checkOutDate}
              </p>
              <p style="color: #666; font-size: 14px; margin: 5px 0; font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px;">
                <strong>Amount:</strong> ₹${totalPrice.toFixed(2)}
              </p>
            </div>
            <p style="color: #555; font-size: 14px; margin-top: 20px;">
              Log in to your Stayy account to view more details and manage your booking.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
              © Stayy. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Failed to send booking confirmation email to host:', error);
    throw new Error('Failed to send booking notification to host');
  }
}

/**
 * Send booking confirmation email to guest
 * @param {string} guestEmail
 * @param {string} guestName
 * @param {string} listingTitle
 * @param {string} hostName
 * @param {string} checkInDate
 * @param {string} checkOutDate
 * @param {number} totalPrice
 */
export async function sendBookingConfirmationGuestEmail(
  guestEmail,
  guestName,
  listingTitle,
  hostName,
  checkInDate,
  checkOutDate,
  totalPrice
) {
  try {
    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: guestEmail,
      subject: 'Your Booking is Confirmed - Stayy',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #000; text-align: center; margin-bottom: 20px;">✓ Booking Confirmed</h1>
            <p style="color: #555; font-size: 16px; margin-bottom: 10px;">Hi ${guestName},</p>
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              Your booking has been confirmed! Here are your reservation details:
            </p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                <strong>Property:</strong> ${listingTitle}
              </p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                <strong>Host:</strong> ${hostName}
              </p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                <strong>Check-in:</strong> ${checkInDate}
              </p>
              <p style="color: #666; font-size: 14px; margin: 5px 0;">
                <strong>Check-out:</strong> ${checkOutDate}
              </p>
              <p style="color: #666; font-size: 14px; margin: 5px 0; font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px;">
                <strong>Total Amount:</strong> ₹${totalPrice.toFixed(2)}
              </p>
            </div>
            <p style="color: #555; font-size: 14px; margin-top: 20px;">
              We look forward to your stay! Save your confirmation details for check-in.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
              © Stayy. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Failed to send booking confirmation email to guest:', error);
    throw new Error('Failed to send booking confirmation');
  }
}

/**
 * Send password reset OTP email
 * @param {string} email
 * @param {string} otpCode
 * @param {string} userName
 */
export async function sendPasswordResetEmail(email, otpCode, userName) {
  try {
    const result = await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: 'Reset Your Password - Stayy',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #000; text-align: center; margin-bottom: 20px;">Reset Your Password</h1>
            <p style="color: #555; font-size: 16px; margin-bottom: 10px;">Hi ${userName},</p>
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password. Use the code below to proceed with resetting your password.
            </p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <p style="font-size: 32px; font-weight: bold; color: #000; margin: 0; letter-spacing: 5px;">
                ${otpCode}
              </p>
            </div>
            <p style="color: #555; font-size: 14px; margin-top: 20px;">
              This code expires in 10 minutes. Do not share this code with anyone.
            </p>
            <p style="color: #d97706; font-size: 14px; margin-top: 15px;">
              <strong>⚠️ If you didn't request this, your account may be compromised. Change your password immediately or contact support.</strong>
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin-bottom: 0;">
              © Stayy. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

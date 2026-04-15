const { Resend } = require("resend");

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev"; // Default Resend test email

const isConfigured = !!RESEND_API_KEY;
const resend = isConfigured ? new Resend(RESEND_API_KEY) : null;

if (!isConfigured) {
  console.warn("WARNING: Resend API key is not configured. Emails will be logged to console.");
}

/**
 * Common function to send email via Resend
 */
const sendEmail = async (to, subject, html) => {
  if (!isConfigured) {
    console.log("--- MOCK EMAIL START (Resend) ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("--- MOCK EMAIL END ---");
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Cal.clone <${FROM_EMAIL}>`,
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Failed to send email via Resend:", error);
      return;
    }

    console.log(`Email sent to ${to} (ID: ${data.id})`);
  } catch (error) {
    console.error("Unexpected error sending email:", error.message);
  }
};

/**
 * Notify booker about successful booking confirmation
 */
exports.sendBookingConfirmation = async (bookerName, bookerEmail, eventTitle, hostName, startTime, endTime) => {
  const subject = `Booking Confirmed: ${eventTitle}`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #059669; margin-top: 0;">Booking Confirmed!</h2>
      <p style="font-size: 16px;">Hi <strong>${bookerName}</strong>,</p>
      <p>Your meeting has been successfully scheduled.</p>

      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f3f4f6;">
        <div style="font-size: 18px; font-weight: 600; color: #111827;">${eventTitle}</div>
        <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">Host: ${hostName}</div>
        <div style="font-size: 14px; color: #6b7280; margin-top: 4px;">Time: ${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}</div>
      </div>

      <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
        Best regards,<br>
        <strong>Cal.clone Scheduling</strong>
      </p>
    </div>
  `;
  await sendEmail(bookerEmail, subject, html);
};

/**
 * Notify booker about booking cancellation
 */
exports.sendBookingCancellation = async (bookerName, bookerEmail, eventTitle) => {
  const subject = `Booking Cancelled: ${eventTitle}`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color: #ef4444; margin-top: 0;">Booking Cancelled</h2>
      <p>Hi <strong>${bookerName}</strong>,</p>
      <p>Your booking for <strong>${eventTitle}</strong> has been cancelled.</p>
      <p>If you'd like to reschedule, please visit the booking page again.</p>

      <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
        Best regards,<br>
        <strong>Cal.clone Scheduling</strong>
      </p>
    </div>
  `;
  await sendEmail(bookerEmail, subject, html);
};

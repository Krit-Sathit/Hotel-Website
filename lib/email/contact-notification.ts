import nodemailer from 'nodemailer';

interface ContactNotification {
  hotelName: string;
  recipient: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  message: string;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[character] || character));
}

export async function sendContactNotification(notification: ContactNotification) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASS;
  const port = Number.parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !user || !password) {
    return { success: false, error: 'Email notifications are not configured.' };
  }

  const html = `
    <h2>New website inquiry for ${escapeHtml(notification.hotelName)}</h2>
    <p><strong>Name:</strong> ${escapeHtml(notification.senderName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(notification.senderEmail)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(notification.senderPhone || 'Not provided')}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(notification.message).replace(/\n/g, '<br />')}</p>
  `;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass: password },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `FlowStay Website <${user}>`,
      to: notification.recipient,
      replyTo: notification.senderEmail,
      subject: `New website inquiry — ${notification.hotelName}`,
      html,
      text: [
        `New website inquiry for ${notification.hotelName}`,
        `Name: ${notification.senderName}`,
        `Email: ${notification.senderEmail}`,
        `Phone: ${notification.senderPhone || 'Not provided'}`,
        '',
        notification.message,
      ].join('\n'),
    });
  } catch (error) {
    console.error('SMTP contact notification failed:', error);
    return { success: false, error: 'Email delivery failed.' };
  }

  return { success: true };
}

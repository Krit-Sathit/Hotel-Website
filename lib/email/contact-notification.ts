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
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_EMAIL_FROM;

  if (!apiKey || !from) {
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

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [notification.recipient],
      reply_to: notification.senderEmail,
      subject: `New website inquiry — ${notification.hotelName}`,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Resend contact notification failed:', detail);
    return { success: false, error: 'Email delivery failed.' };
  }

  return { success: true };
}

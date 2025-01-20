
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
  url: 'https://api.eu.mailgun.net',
});

export const sendEmail = async ({
  from,
  to,
  subject,
  text,
  html,
  attachments = [],
}: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: any[];
}) => {
  try {
    const msg = await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from,
      to,
      subject,
      text,
      html,
      attachment: attachments,
    });
    return msg;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default mg;
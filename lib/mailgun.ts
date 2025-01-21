import formData from "form-data";
import Mailgun from "mailgun.js";

const mailgun = new Mailgun(formData);

console.log("Mailgun Config:", {
  username: "api",
  key: process.env.MAILGUN_API_KEY?.substring(0, 8) + "...",
  url: process.env.MAILGUN_ENDPOINT,
  domain: process.env.MAILGUN_DOMAIN,
});

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
  url: process.env.MAILGUN_ENDPOINT,
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
    if (!process.env.MAILGUN_DOMAIN) {
      throw new Error("MAILGUN_DOMAIN is not configured");
    }

    console.log("Attempting to send email:", {
      from,
      to,
      subject,
      domain: process.env.MAILGUN_DOMAIN,
    });

    const msg = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from,
      to,
      subject,
      text,
      html,
      attachment: attachments,
    });

    console.log("Email sent successfully:", msg.id);
    return msg;
  } catch (error: any) {
    console.error("Detailed Mailgun error:", {
      error: error.message,
      status: error.status,
      details: error.details,
      stack: error.stack,
    });
    throw error;
  }
};

export default mg;

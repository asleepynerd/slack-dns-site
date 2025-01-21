export async function POST(req: Request) {
  try {
    // ... authorization code

    const message = new Message({
      inboxId,
      from: fromEmail,
      to: toEmail,
      subject,
      body: text,
      html,
      sent: true,
      createdAt: new Date(),
      receivedAt: new Date(),
    });

    await message.save();
    // ... rest of the code
  } catch (error) {
    // ... error handling
  }
}

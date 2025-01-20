
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sendEmail } from '@/lib/mailgun';
import { Message, Inbox } from '@/lib/models/inbox';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { from, to, subject, text, html } = data;

    const inbox = await Inbox.findOne({
      email: from,
      userId: session.user.id,
      active: true
    });

    if (!inbox) {
      return NextResponse.json({ error: 'Inbox not found' }, { status: 404 });
    }

    const result = await sendEmail({
      from,
      to,
      subject,
      text,
      html
    });

    const message = new Message({
      messageId: result.id,
      inboxId: inbox._id,
      from,
      to,
      subject,
      body: text,
      html,
      sent: true
    });

    await message.save();

    return NextResponse.json({ status: 'success', messageId: result.id });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
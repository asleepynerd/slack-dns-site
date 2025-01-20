
import { NextResponse } from 'next/server';
import { Message, Inbox } from '@/lib/models/inbox';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const incomingEmail = {
      from: data.get('sender') as string,
      to: data.get('recipient') as string,
      subject: data.get('subject') as string,
      body: data.get('body-plain') as string,
      html: data.get('body-html') as string,
      messageId: data.get('Message-Id') as string,
    };

    const inbox = await Inbox.findOne({ email: incomingEmail.to, active: true });
    if (!inbox) {
      return NextResponse.json({ error: 'Inbox not found' }, { status: 404 });
    }

    const message = new Message({
      ...incomingEmail,
      inboxId: inbox._id,
    });

    await message.save();
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
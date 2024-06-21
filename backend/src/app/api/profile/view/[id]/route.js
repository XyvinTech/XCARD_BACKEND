import connectDB from '../../../../../../../../backend/src/configs/db';
import Profile from '../../../../../../../../backend/src/models/Profile';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  await connectDB();

  const { id } = params;

  try {
    const profile = await Profile.findOneAndUpdate(
      { 'card.cardId': id },
      { $inc: { visitCount: 1 } },
      { new: true }
    );

    if (!profile) {
      return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: profile }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
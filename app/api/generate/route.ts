
import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/gemini';
import { StyleType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { image, style } = await req.json();
    
    if (!image || !style) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const imageUrls = await generateWithGemini(image, style as StyleType);
    
    return NextResponse.json({ imageUrls });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

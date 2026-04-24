import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { extractPDF } from '@/utils/extraction';
import { parseExtractedData } from '@/utils/parse-extraction';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  if (!file.name.endsWith('.pdf')) {
    return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const extractedData = await extractPDF(arrayBuffer, file.name);
    const lineItems = parseExtractedData(extractedData);

    return NextResponse.json({
      success: true,
      message: 'Extraction and parsing succeeded.',
      result: { lineItems, extractedData },
    });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Unknown extraction error';
    return NextResponse.json({ error: 'Extraction failed', details: message }, { status: 500 });
  }
}
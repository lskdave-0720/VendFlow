import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.PDF_CO_API_KEY!;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing PDF_CO_API_KEY environment variable' }, { status: 500 });
  }

  // Minimal PDF string (a blank page)
  const pdfBase64 = 'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyA+PgplbmRvYmoKdHJhaWxlcgo8PCAvUm9vdCAxIDAgUiA+Pg==';
  const formData = new FormData();
  formData.append('file', new Blob([Buffer.from(pdfBase64, 'base64')], { type: 'application/pdf' }), 'test.pdf');
  formData.append('outputFormat', 'JSON');
  formData.append('parseTables', 'true');
  formData.append('inline', 'true');

  try {
    const res = await fetch('https://api.pdf.co/v1/pdf/documentparser', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
      },
      body: formData,
    });
    const data = await res.json();
    return NextResponse.json({ status: res.status, body: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
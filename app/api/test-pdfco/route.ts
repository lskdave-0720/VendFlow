// app/api/test-pdfco/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.PDF_CO_API_KEY!;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing PDF_CO_API_KEY' }, { status: 500 });
  }

  try {
    const pdfBase64 = 'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyA+PgplbmRvYmoKdHJhaWxlcgo8PCAvUm9vdCAxIDAgUiA+Pg==';
    const pdfBytes = new Uint8Array(Buffer.from(pdfBase64, 'base64'));
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Upload
    const uploadForm = new FormData();
    uploadForm.append('file', blob, 'test.pdf');

    const uploadRes = await fetch('https://api.pdf.co/v1/file/upload', {
      method: 'POST',
      headers: { 'x-api-key': apiKey },
      body: uploadForm,
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok || uploadData.error) {
      return NextResponse.json({
        status: uploadRes.status,
        step: 'upload',
        body: uploadData,
      });
    }

    // Parse
    const parserBody = JSON.stringify({
      url: uploadData.url,
      outputFormat: 'JSON',
      inline: true,
    });

    const parserRes = await fetch('https://api.pdf.co/v1/pdf/documentparser', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: parserBody,
    });

    const parserData = await parserRes.json();
    return NextResponse.json({
      upload: { status: uploadRes.status, url: uploadData.url },
      parser: { status: parserRes.status, body: parserData },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
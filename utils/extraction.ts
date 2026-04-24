// utils/extraction.ts
export async function extractPDF(fileArrayBuffer: ArrayBuffer, fileName: string) {
  const apiKey = process.env.PDF_CO_API_KEY!;

  // Step 1: Upload file to PDF.co temporary storage
  const blob = new Blob([fileArrayBuffer], { type: 'application/pdf' });
  const uploadForm = new FormData();
  uploadForm.append('file', blob, fileName);

  const uploadRes = await fetch('https://api.pdf.co/v1/file/upload', {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: uploadForm,
  });

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || uploadData.error) {
    throw new Error(`Upload failed: ${uploadData.message || uploadData.error || uploadRes.statusText}`);
  }

  const uploadedUrl = uploadData.url;

  // Step 2: Call document parser with the URL
  const parserBody = JSON.stringify({
    url: uploadedUrl,
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
  if (!parserRes.ok || parserData.error) {
    throw new Error(`Parser error: ${parserData.message || parserData.error || parserRes.statusText}`);
  }

  return parserData;
}
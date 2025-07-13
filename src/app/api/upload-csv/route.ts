import { BlobServiceClient } from '@azure/storage-blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const csvBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(csvBuffer);

    const connectionString = process.env.CONNECTION_STRING!;
    const containerName = process.env.CONTAINER_NAME!;

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const filename = req.headers.get("x-filename") || `${Date.now()}.csv`;
    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: 'text/csv' },
    });

    return NextResponse.json({ message: 'CSV file uploaded successfully', filename });
  } catch (error) {
    console.error('CSV Upload error:', error);
    return NextResponse.json({ error: 'CSV upload failed' }, { status: 500 });
  }
}

import { documentReceiptProxy } from '@/lib/document-receipt-proxy';
export async function POST(request: Request) { return documentReceiptProxy(request); }

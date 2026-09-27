import { documentReceiptProxy } from '@/lib/document-receipt-proxy';
export async function GET(request: Request) { return documentReceiptProxy(request); }

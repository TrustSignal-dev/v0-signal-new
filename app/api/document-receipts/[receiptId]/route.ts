import { documentReceiptProxy } from '@/lib/document-receipt-proxy';
export async function GET(request: Request, context: { params: Promise<{ receiptId: string }> }) {
  return documentReceiptProxy(request, (await context.params).receiptId);
}

'use client';

import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

const BARCODE_SCALE = 2.75;
const QR_PX = 320;

/**
 * Tạo 2 ảnh barcode (CODE128) và 1 QR — độ phân giải cao để in PDF không bị mờ.
 * Chỉ gọi trên trình duyệt (canvas).
 */
export async function generateKskChiDinhCodes(maHoSo: string, sid: string): Promise<{
  barcode1: string;
  barcode2: string;
  qr: string;
}> {
  const safeHs = (maHoSo || '0').trim() || '0';
  const safeSid = (sid || safeHs).trim() || safeHs;

  const barcodeToHiResPng = (text: string) => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, text, {
      format: 'CODE128',
      width: 2.4,
      height: 96,
      displayValue: true,
      margin: 10,
      /** Chữ Mã Hồ sơ / SID dưới vạch — to hơn 1 cỡ và đậm */
      fontSize: 18,
      fontOptions: 'bold',
    });
    const out = document.createElement('canvas');
    out.width = Math.round(canvas.width * BARCODE_SCALE);
    out.height = Math.round(canvas.height * BARCODE_SCALE);
    const ctx = out.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, 0, 0, out.width, out.height);
    }
    return out.toDataURL('image/png');
  };

  const [barcode1, barcode2, qr] = await Promise.all([
    Promise.resolve(barcodeToHiResPng(safeHs)),
    Promise.resolve(barcodeToHiResPng(safeSid)),
    QRCode.toDataURL(`KSK|HS:${safeHs}|SID:${safeSid}`, {
      width: QR_PX,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#000000ff', light: '#ffffffff' },
    }),
  ]);

  return { barcode1, barcode2, qr };
}

// Export, Download & Thermal Print Utilities for RestoFlow

/**
 * Downloads data as a CSV file directly to user's device
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCell = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows: string[] = [];
  csvRows.push(headers.map(escapeCell).join(','));

  rows.forEach((row) => {
    csvRows.push(row.map(escapeCell).join(','));
  });

  const csvString = csvRows.join('\r\n');
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads object/array data as a JSON file directly to user's device
 */
export function downloadJson(filename: string, data: any): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ThermalReceiptData {
  orderId: string;
  table?: string;
  tableType?: string;
  customer?: string;
  phone?: string;
  staff?: string;
  items: Array<{ name: string; qty: number; price: number; station?: string; modifiers?: string }>;
  subtotal: number;
  cgst: number;
  sgst: number;
  serviceCharge?: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
  date?: string;
  receiptNumber?: string;
}

/**
 * Opens a dedicated print dialog for 80mm ESC/POS Thermal Receipt
 */
export function printThermalReceipt(receipt: ThermalReceiptData): void {
  const printWindow = window.open('', '_blank', 'width=380,height=600');
  if (!printWindow) {
    window.print();
    return;
  }

  const receiptNum = receipt.receiptNumber || `RCP-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderTime = receipt.date || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  const itemsHtml = receipt.items
    .map(
      (it) => `
    <tr>
      <td style="text-align: left; padding: 3px 0;">${it.name}${it.modifiers ? `<br><small style="color:#666;">* ${it.modifiers}</small>` : ''}</td>
      <td style="text-align: center; padding: 3px 0;">${it.qty}</td>
      <td style="text-align: right; padding: 3px 0;">₹${(it.price * it.qty).toLocaleString('en-IN')}</td>
    </tr>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Receipt - ${receipt.orderId}</title>
  <style>
    @media print {
      @page { margin: 0; size: 80mm auto; }
      body { margin: 0; padding: 8px; }
    }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      line-height: 1.3;
      color: #000;
      background: #fff;
      max-width: 320px;
      margin: 0 auto;
      padding: 12px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    .double-divider { border-top: 2px solid #000; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    .header-title { font-size: 15px; font-weight: 900; margin-bottom: 2px; }
    .small { font-size: 10px; }
  </style>
</head>
<body>
  <div class="text-center">
    <div class="header-title">SPICEROUTE GOURMET HOSPITALITY</div>
    <div class="small">SpiceRoute Kitchen #01 (MG Road)</div>
    <div class="small">#42 MG Road, Brigade Junction, Bengaluru 560001</div>
    <div class="small">GSTIN: 29AAAAA0000A1Z5 | FSSAI: 11223344000192</div>
  </div>

  <div class="divider"></div>

  <div style="display: flex; justify-content: space-between;" class="small">
    <span><b>Order:</b> ${receipt.orderId}</span>
    <span><b>${receipt.table || 'Takeaway'}</b></span>
  </div>
  <div style="display: flex; justify-content: space-between;" class="small">
    <span><b>Rcpt #:</b> ${receiptNum}</span>
    <span><b>Server:</b> ${receipt.staff || 'Aniket S.'}</span>
  </div>
  ${receipt.customer ? `<div class="small"><b>Customer:</b> ${receipt.customer} ${receipt.phone ? `(${receipt.phone})` : ''}</div>` : ''}
  <div class="small"><b>Date:</b> ${orderTime}</div>

  <div class="divider"></div>

  <table>
    <thead>
      <tr style="border-bottom: 1px dashed #000;">
        <th style="text-align: left; padding-bottom: 4px;">ITEM</th>
        <th style="text-align: center; padding-bottom: 4px;">QTY</th>
        <th style="text-align: right; padding-bottom: 4px;">AMT</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="divider"></div>

  <table>
    <tr>
      <td style="text-align: left;">Subtotal:</td>
      <td class="text-right">₹${receipt.subtotal.toLocaleString('en-IN')}</td>
    </tr>
    ${receipt.discount ? `<tr><td style="text-align: left;">Discount (10%):</td><td class="text-right">-₹${receipt.discount.toLocaleString('en-IN')}</td></tr>` : ''}
    <tr>
      <td style="text-align: left;">CGST (2.5%):</td>
      <td class="text-right">₹${receipt.cgst.toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td style="text-align: left;">SGST (2.5%):</td>
      <td class="text-right">₹${receipt.sgst.toLocaleString('en-IN')}</td>
    </tr>
    ${receipt.serviceCharge ? `<tr><td style="text-align: left;">Service Charge (5%):</td><td class="text-right">₹${receipt.serviceCharge.toLocaleString('en-IN')}</td></tr>` : ''}
    <tr style="font-size: 14px; font-weight: bold; border-top: 1px solid #000;">
      <td style="padding-top: 4px;">NET TOTAL:</td>
      <td class="text-right" style="padding-top: 4px;">₹${receipt.total.toLocaleString('en-IN')}</td>
    </tr>
    <tr>
      <td style="font-size: 11px;">Payment Mode:</td>
      <td class="text-right font-bold">${(receipt.paymentMethod || 'UPI / ONLINE').toUpperCase()}</td>
    </tr>
  </table>

  <div class="double-divider"></div>

  <div class="text-center small">
    <div>*** THANK YOU FOR DINING WITH US ***</div>
    <div>Powered by RestoFlow · InsForge Cloud Engine</div>
    <div>Visit again for 10% loyalty perks!</div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Prints a formatted GST Compliance & Financial Audit Sheet
 */
export function printTaxReport(data: {
  timeRange: string;
  turnover: number;
  cgst: number;
  sgst: number;
  itc: number;
  netTax: number;
  totalOrders: number;
  aov: number;
}): void {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    window.print();
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>GST Tax Report - RestoFlow</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 30px;
      color: #111;
      line-height: 1.5;
    }
    .header { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
    .badge { background: #e0f2fe; color: #0284c7; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { padding: 10px 12px; border: 1px solid #ddd; text-align: left; }
    th { background: #f8fafc; font-weight: bold; }
    .total-row { font-weight: bold; background: #f1f5f9; }
    .text-right { text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h1 style="margin:0; font-size:24px;">GSTR-3B Compliant Tax Summary Report</h1>
        <p style="margin:4px 0 0 0; color:#666;">SpiceRoute Gourmet Hospitality LLP • GSTIN: 29AAAAA0000A1Z5</p>
      </div>
      <span class="badge">Period: ${data.timeRange.toUpperCase()}</span>
    </div>
  </div>

  <h3>Financial &amp; Tax Ledger Summary</h3>
  <table>
    <thead>
      <tr>
        <th>Tax Component / Metric</th>
        <th>Tax Rate</th>
        <th class="text-right">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Taxable F&B Turnover</td>
        <td>-</td>
        <td class="text-right">₹${data.turnover.toLocaleString('en-IN')}.00</td>
      </tr>
      <tr>
        <td>Central GST (CGST Output)</td>
        <td>2.50%</td>
        <td class="text-right">₹${data.cgst.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td>State GST (SGST Output)</td>
        <td>2.50%</td>
        <td class="text-right">₹${data.sgst.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td>Eligible Input Tax Credit (ITC on Raw Supplies)</td>
        <td>-</td>
        <td class="text-right" style="color:#059669;">-₹${data.itc.toLocaleString('en-IN')}</td>
      </tr>
      <tr class="total-row">
        <td>NET GST PAYABLE TO GOVERNMENT</td>
        <td>5.0% Net</td>
        <td class="text-right" style="color:#dc2626; font-size:16px;">₹${data.netTax.toLocaleString('en-IN')}</td>
      </tr>
    </tbody>
  </table>

  <h3 style="margin-top:24px;">Operational Telemetry</h3>
  <table>
    <tr>
      <td>Total Orders Processed</td>
      <td class="text-right font-bold">${data.totalOrders}</td>
    </tr>
    <tr>
      <td>Average Order Value (AOV)</td>
      <td class="text-right font-bold">₹${data.aov}</td>
    </tr>
    <tr>
      <td>Database Audit Timestamp</td>
      <td class="text-right">${new Date().toISOString()}</td>
    </tr>
  </table>

  <p style="margin-top:30px; font-size:12px; color:#666; text-align:center;">
    Generated by RestoFlow Financial Intelligence Engine · Backed by InsForge PostgreSQL
  </p>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Prints QR Table Codes for dining tables
 */
export function printQrMenuSheet(storeName: string): void {
  const printWindow = window.open('', '_blank', 'width=800,height=800');
  if (!printWindow) return;

  const tables = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10', 'T11', 'T12'];
  const cardsHtml = tables
    .map(
      (t) => `
    <div style="border: 2px solid #000; border-radius: 12px; padding: 16px; text-align: center; width: 160px;">
      <div style="font-weight: 900; font-size: 16px;">${storeName}</div>
      <div style="font-size: 12px; margin-bottom: 8px;">Dine-In Menu</div>
      <div style="width: 110px; height: 110px; margin: 0 auto; background: #000; display:flex; align-items:center; justify-content:center; color:#fff; border-radius:8px;">
        <span style="font-family:monospace; font-size:11px;">[QR CODE ${t}]</span>
      </div>
      <div style="font-weight: bold; font-size: 18px; margin-top: 8px; color: #f97316;">TABLE ${t}</div>
      <div style="font-size: 9px; color: #666;">Scan to Order &amp; Pay</div>
    </div>`
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Table QR Codes - ${storeName}</title>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .grid { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
  </style>
</head>
<body>
  <h2 style="text-align:center;">Table QR Menu Codes - ${storeName}</h2>
  <div class="grid">${cardsHtml}</div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

import { formatDateDdMmYyyy } from "./date-utils";
import {
  getWeekEndFriday,
  getWeekStartSaturday,
  formatWeekLabel,
} from "./getWeekBoundary";
import { amountToMarathiWords } from "./amount-to-words";
import type { Worker } from "../types/worker.types";
import type {
  WeeklyPayment,
  WeeklyPaymentKPIs,
  WeeklyPaymentGroup,
} from "../types/weekly-payment.types";

interface GeneratePdfHtmlParams {
  worker: Worker;
  payments: WeeklyPayment[];
  kpis: WeeklyPaymentKPIs;
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateWeeklyPaymentPdfHtml({
  worker,
  payments,
  kpis,
}: GeneratePdfHtmlParams): string {
  // Group payments into weekly buckets (Sat - Fri), sorted chronologically
  const map = new Map<string, WeeklyPaymentGroup>();

  for (const payment of payments) {
    const fridayDate = getWeekEndFriday(payment.payment_date);
    const saturdayDate = getWeekStartSaturday(fridayDate);
    const weekKey = `week_${fridayDate}`;

    const existing = map.get(weekKey);
    if (existing) {
      existing.payments.push(payment);
      existing.totalAmount += payment.amount;
      existing.entriesCount += 1;
    } else {
      map.set(weekKey, {
        weekKey,
        weekStartSaturday: saturdayDate,
        weekEndFriday: fridayDate,
        totalAmount: payment.amount,
        entriesCount: 1,
        payments: [payment],
      });
    }
  }

  const sortedWeeklyGroups = Array.from(map.values());
  sortedWeeklyGroups.sort((a, b) =>
    a.weekStartSaturday.localeCompare(b.weekStartSaturday)
  );

  sortedWeeklyGroups.forEach((g) => {
    g.payments.sort((p1, p2) => p1.payment_date.localeCompare(p2.payment_date));
  });

  const todayStr = formatDateDdMmYyyy(new Date().toISOString().split("T")[0]);
  const currentTimeStr = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const statementId = `WP-${worker.id.slice(0, 8).toUpperCase()}`;
  const workerCategory =
    worker.category === "BHATKAR" ? "भटकर (Bhatkar)" : "आल्यावाले (Aalyawale)";

  const workerNameSafe = escapeHtml(worker.full_name);
  const workerPhoneSafe = escapeHtml(worker.phone || "उपलब्ध नाही");
  const workerAddressSafe = escapeHtml(worker.address || "—");
  const workerCodeSafe = escapeHtml(
    worker.code || worker.id_proof_number || "—"
  );

  const totalDecidedFmt = kpis.total_decided_amount.toLocaleString("en-IN");
  const totalPaymentFmt = kpis.total_payment.toLocaleString("en-IN");
  const remainingFmt = kpis.remaining_amount.toLocaleString("en-IN");
  const cashAmountFmt = kpis.cash_amount.toLocaleString("en-IN");
  const phonepayAmountFmt = kpis.phonepay_amount.toLocaleString("en-IN");
  const marathiWords = amountToMarathiWords(kpis.total_payment);

  // WhatsApp summary text to inject in JS
  const whatsappSummaryRaw = `📋 *साप्ताहिक पेमेंट पावती - विशाल विटभट्टी उद्योजक*
👤 *कामगार नाव:* ${worker.full_name} (${workerCategory})
📱 *मोबाईल:* ${worker.phone || "—"}
📅 *दिनांक:* ${todayStr}
🆔 *पावती क्र.:* ${statementId}
----------------------------------------
💰 *ठरलेली उचल/रक्कम:* ₹${totalDecidedFmt}
*आतापर्यंत एकूण भरणा:* ₹${totalPaymentFmt}
*शिल्लक देय बाकी:* ₹${remainingFmt}
----------------------------------------
*भरणा तपशील:*
• रोख भरणा: ₹${cashAmountFmt} (${kpis.cash_count} वेळा)
• फोनपे भरणा: ₹${phonepayAmountFmt} (${kpis.phonepay_count} वेळा)
*एकूण आठवडे:* ${sortedWeeklyGroups.length} | *एकूण नोंदी:* ${payments.length}

(सविस्तर अधिकृत पीडीएफ पावती सोबत जोडली आहे)`;

  const whatsappSummaryEscaped = JSON.stringify(whatsappSummaryRaw);

  // Render HTML for weekly payment groups
  const weeklyTablesHtml = sortedWeeklyGroups
    .map((group, groupIdx) => {
      const weekLabel = formatWeekLabel(
        group.weekStartSaturday,
        group.weekEndFriday
      );
      const weekTotalFmt = group.totalAmount.toLocaleString("en-IN");

      const rowsHtml = group.payments
        .map((p, pIdx) => {
          const dayName = escapeHtml(p.day_of_week);
          const dateFormatted = formatDateDdMmYyyy(p.payment_date);
          const amtFmt = p.amount.toLocaleString("en-IN");
          const payer = escapeHtml(p.paid_by);
          const note = escapeHtml(p.notes || "—");

          const methodBadge =
            p.payment_method === "CASH"
              ? `<span class="badge-cash">रोख (Cash)</span>`
              : `<span class="badge-phonepe">फोनपे (PhonePe)</span>`;

          return `
            <tr>
              <td class="text-center font-mono text-muted">${pIdx + 1}</td>
              <td class="font-bold text-amber">${dayName}</td>
              <td class="font-mono">${dateFormatted}</td>
              <td class="font-mono font-bold text-emerald text-right">₹${amtFmt}</td>
              <td class="font-medium">${payer}</td>
              <td>${methodBadge}</td>
              <td class="text-muted note-cell">${note}</td>
            </tr>
          `;
        })
        .join("");

      return `
        <div class="week-block">
          <div class="week-banner">
            <div class="week-title">
              आठवडा ${groupIdx + 1}: ${weekLabel}
            </div>
            <div class="week-total font-mono">
              आठवडा भरणा: <span class="text-emerald font-bold">₹${weekTotalFmt}</span> (${group.entriesCount} नोंद)
            </div>
          </div>
          <table class="payment-table">
            <thead>
              <tr>
                <th style="width: 38px;" class="text-center">अ.क्र.</th>
                <th style="width: 80px;">वार</th>
                <th style="width: 85px;">दिनांक</th>
                <th style="width: 100px;" class="text-right">रक्कम (₹)</th>
                <th style="width: 130px;">पैसे देणारा</th>
                <th style="width: 100px;">भरणा पद्धत</th>
                <th>नोंद / शेरा</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="mr" translate="no" class="notranslate">
<head>
  <meta charset="utf-8" />
  <meta name="google" content="notranslate" />
  <meta name="googlebot" content="notranslate" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>साप्ताहिक_पेमेंट_पावती_${workerNameSafe}_${todayStr}.pdf</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    /* Reset & Core Setup */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      letter-spacing: normal !important;
    }

    body {
      font-family: 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #383c40;
      color: #0f172a;
      line-height: 1.45;
      font-size: 11px;
      letter-spacing: normal !important;
      text-transform: none !important;
      -webkit-font-smoothing: antialiased;
    }

    /* Fixed Dark Topbar for PDF Viewer Experience */
    .pdf-toolbar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 999;
      background: #1e2226;
      border-bottom: 1px solid #32383e;
      color: #f1f5f9;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .doc-icon {
      background: #2563eb;
      color: #ffffff;
      padding: 6px 8px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: bold;
    }

    .doc-meta {
      display: flex;
      flex-direction: column;
    }

    .doc-name {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: normal !important;
    }

    .doc-sub {
      font-size: 11px;
      color: #94a3b8;
    }

    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      padding: 7px 14px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
      outline: none;
      user-select: none;
    }

    .btn-primary {
      background: #2563eb;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }

    .btn-success {
      background: #10b981;
      color: #ffffff;
    }
    .btn-success:hover {
      background: #059669;
    }

    .btn-dark {
      background: #2d3339;
      color: #e2e8f0;
      border: 1px solid #4b5563;
    }
    .btn-dark:hover {
      background: #3c444c;
      color: #ffffff;
    }

    /* Helpful Notification Banner below toolbar */
    .pdf-info-banner {
      background: #1e3a5f;
      color: #bfdbfe;
      border-bottom: 1px solid #2b4c7e;
      padding: 8px 16px;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    /* PDF Viewport & A4 Sheet Container */
    .pdf-viewport {
      padding: 24px 16px 48px;
      display: flex;
      justify-content: center;
    }

    .a4-sheet {
      width: 100%;
      max-width: 794px;
      background: #ffffff;
      color: #0f172a;
      border-radius: 4px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      padding: 32px 36px;
    }

    /* Official Document Header */
    .sheet-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 10px;
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .company-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: normal !important;
      text-transform: none !important;
      display: flex;
      align-items: center;
      gap: 8px;
      line-height: 1.4;
    }

    .badge-official {
      background: #f1f5f9;
      color: #334155;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      letter-spacing: normal !important;
      text-transform: none !important;
      white-space: nowrap;
    }

    .sheet-subtitle {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 2px;
    }

    .sheet-desc {
      font-size: 10px;
      color: #64748b;
    }

    .header-ref-box {
      text-align: right;
      font-family: monospace;
      font-size: 11px;
      flex-shrink: 0;
    }

    .ref-id {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
    }

    .ref-date {
      color: #475569;
      font-size: 10.5px;
      margin-top: 2px;
    }

    .ref-time {
      color: #94a3b8;
      font-size: 9.5px;
    }

    /* Worker Details Box */
    .worker-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      background: #f8fafc;
      padding: 10px 14px;
      margin-bottom: 12px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      font-size: 11px;
    }

    .worker-field-label {
      font-size: 9.5px;
      color: #64748b;
      font-weight: 600;
      display: block;
      margin-bottom: 2px;
    }

    .worker-field-value {
      font-weight: 700;
      color: #0f172a;
      word-break: break-word;
    }

    /* Financial KPI Summary Cards */
    .kpi-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }

    .kpi-item {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 10px;
      background: #ffffff;
    }

    .kpi-item.agreed {
      background: #fffbeb;
      border-color: #fde68a;
    }
    .kpi-item.paid {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }
    .kpi-item.balance {
      background: #fef2f2;
      border-color: #fecaca;
    }
    .kpi-item.methods {
      background: #eef2ff;
      border-color: #c7d2fe;
    }

    .kpi-title {
      font-size: 9.5px;
      font-weight: 700;
      color: #475569;
    }

    .kpi-amount {
      font-size: 14px;
      font-weight: 800;
      font-family: monospace;
      color: #0f172a;
      margin-top: 3px;
    }

    .kpi-subtext {
      font-size: 9px;
      color: #64748b;
      margin-top: 2px;
    }

    /* Table & Breakdown Section */
    .section-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-bottom: 10px;
    }

    .section-title {
      font-size: 11.5px;
      font-weight: 700;
      text-transform: none !important;
      letter-spacing: normal !important;
      color: #1e293b;
    }

    .section-meta {
      font-size: 10px;
      font-family: monospace;
      color: #64748b;
    }

    .week-block {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }

    .week-banner {
      background: #f1f5f9;
      border-bottom: 1px solid #cbd5e1;
      padding: 6px 10px;
      font-weight: 700;
      font-size: 11px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .payment-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
    }

    .payment-table th, .payment-table td {
      border: 1px solid #cbd5e1;
      padding: 5px 8px;
      text-align: left;
    }

    .payment-table th {
      background: #f8fafc;
      font-weight: 700;
      color: #334155;
      font-size: 10px;
    }

    .payment-table tbody tr:hover {
      background: #f8fafc;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-mono { font-family: monospace; }
    .font-bold { font-weight: bold; }
    .font-medium { font-weight: 500; }
    .text-muted { color: #64748b; font-size: 9.5px; }
    .text-emerald { color: #15803d; }
    .text-amber { color: #b45309; }

    .badge-cash {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      background: #dcfce7;
      color: #166534;
      font-weight: 700;
      font-size: 9px;
      border: 1px solid #86efac;
    }

    .badge-phonepe {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      background: #e0e7ff;
      color: #3730a3;
      font-weight: 700;
      font-size: 9px;
      border: 1px solid #a5b4fc;
    }

    /* Grand Total Box */
    .grand-total-card {
      border: 2px solid #0f172a;
      border-radius: 6px;
      padding: 10px 14px;
      background: #f8fafc;
      margin-top: 14px;
      page-break-inside: avoid;
    }

    .grand-total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }

    .grand-total-amount {
      font-size: 17px;
      font-family: monospace;
      color: #15803d;
      font-weight: 800;
    }

    .in-words-row {
      border-top: 1px solid #cbd5e1;
      margin-top: 5px;
      padding-top: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #334155;
    }

    /* Signatures Section */
    .signatures-container {
      margin-top: 36px;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      page-break-inside: avoid;
    }

    .sig-box {
      width: 30%;
      text-align: center;
      border-top: 1px dashed #64748b;
      padding-top: 6px;
      font-size: 10px;
      font-weight: 700;
      color: #334155;
    }

    .sig-sub {
      font-size: 9px;
      font-weight: normal;
      color: #64748b;
      margin-top: 2px;
    }

    /* Legal Footer */
    .sheet-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      margin-top: 18px;
      font-size: 9px;
      color: #64748b;
      line-height: 1.5;
    }

    /* Print Overrides */
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }

    @media print {
      body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .no-print {
        display: none !important;
      }
      .pdf-viewport {
        padding: 0 !important;
        margin: 0 !important;
      }
      .a4-sheet {
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        max-width: 100% !important;
        width: 100% !important;
      }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .week-block, .grand-total-card, .signatures-container {
        page-break-inside: avoid !important;
      }
    }
  </style>
</head>
<body class="notranslate" translate="no">
  <!-- Top PDF Action Toolbar (Hidden when printing/saving PDF) -->
  <header class="pdf-toolbar no-print">
    <div class="toolbar-left">
      <div class="doc-icon">PDF</div>
      <div class="doc-meta">
        <div class="doc-name">साप्ताहिक_पेमेंट_पावती_${workerNameSafe}.pdf</div>
        <div class="doc-sub">
          कामगार: ${workerNameSafe} (${workerCategory}) • एकूण भरणा: ₹${totalPaymentFmt}
        </div>
      </div>
    </div>

    <div class="toolbar-actions">
      <button type="button" class="btn btn-primary" id="btnDownload" onclick="downloadPdfDirectly()" title="थेट PDF फाईल डाऊनलोड करा">
        📥 PDF डाऊनलोड करा (Download PDF)
      </button>

      <button type="button" class="btn btn-success" id="btnWhatsappCopy" onclick="copyWhatsAppSummary()" title="कामगाराला पाठवण्यासाठी व्हॉट्सॲप मजकूर कॉपी करा">
        📋 व्हॉट्सॲप मजकूर कॉपी
      </button>

      <button type="button" class="btn btn-dark" onclick="window.close()" title="हा टॅब बंद करा">
        ✕ बंद करा
      </button>
    </div>
  </header>

  <div class="pdf-info-banner no-print">
    <span>💡 <strong>टीप:</strong> <strong>&apos;PDF डाऊनलोड करा&apos;</strong> वर क्लिक करताच ही पावती थेट PDF फाईल म्हणून डाऊनलोड होईल. डाऊनलोड झालेली PDF आपण कामगाराला WhatsApp वर पाठवू शकता.</span>
    <span class="font-mono">पावती क्र.: ${statementId}</span>
  </div>

  <!-- PDF Viewport Wrapper -->
  <main class="pdf-viewport">
    <!-- Clean A4 Sheet -->
    <article class="a4-sheet" id="pdf-sheet-content">
      <!-- 1. Header -->
      <section class="sheet-header">
        <div>
          <div class="company-title">
            <span>विशाल विटभट्टी उद्योजक</span>
            <span class="badge-official">अधिकृत पावती</span>
          </div>
          <h1 class="sheet-subtitle">
            कामगार साप्ताहिक पेमेंट हिशोब पावती व विवरणपत्र
          </h1>
          <p class="sheet-desc">
            (Worker Weekly Payment Ledger &amp; Disbursement Statement)
          </p>
        </div>

        <div class="header-ref-box">
          <div class="ref-id">पावती क्र.: ${statementId}</div>
          <div class="ref-date">दिनांक: ${todayStr}</div>
          <div class="ref-time">वेळ: ${currentTimeStr}</div>
        </div>
      </section>

      <!-- 2. Worker Information Card -->
      <section class="worker-card">
        <div>
          <span class="worker-field-label">कामगाराचे नाव:</span>
          <span class="worker-field-value">${workerNameSafe}</span>
        </div>
        <div>
          <span class="worker-field-label">कामगार वर्ग:</span>
          <span class="worker-field-value">${workerCategory}</span>
        </div>
        <div>
          <span class="worker-field-label">मोबाईल क्र.:</span>
          <span class="worker-field-value font-mono">${workerPhoneSafe}</span>
        </div>
        <div>
          <span class="worker-field-label">गाव / पत्ता:</span>
          <span class="worker-field-value">${workerAddressSafe}</span>
        </div>
      </section>

      <!-- 3. Financial KPI Summary -->
      <section class="kpi-container">
        <div class="kpi-item agreed">
          <div class="kpi-title">ठरलेली उचल/रक्कम</div>
          <div class="kpi-amount">₹${totalDecidedFmt}</div>
          <div class="kpi-subtext">निश्चित उचल रक्कम</div>
        </div>

        <div class="kpi-item paid">
          <div class="kpi-title text-emerald">एकूण दिलेला भरणा</div>
          <div class="kpi-amount text-emerald">₹${totalPaymentFmt}</div>
          <div class="kpi-subtext">${payments.length} साप्ताहिक नोंदी</div>
        </div>

        <div class="kpi-item balance">
          <div class="kpi-title text-amber">उर्वरित शिल्लक बाकी</div>
          <div class="kpi-amount text-amber">₹${remainingFmt}</div>
          <div class="kpi-subtext">${kpis.remaining_amount > 0 ? "देणे बाकी शिल्लक" : "पूर्ण भरणा झाला"}</div>
        </div>

        <div class="kpi-item methods">
          <div class="kpi-title">भरणा पद्धती</div>
          <div style="margin-top: 3px; font-size: 10.5px; font-family: monospace;">
            <div>रोख: <strong>₹${cashAmountFmt}</strong> (${kpis.cash_count} वेळा)</div>
            <div>फोनपे: <strong>₹${phonepayAmountFmt}</strong> (${kpis.phonepay_count} वेळा)</div>
          </div>
        </div>
      </section>

      <!-- 4. Weekly Payments Breakdown Table -->
      <section>
        <div class="section-title-row">
          <h2 class="section-title">
            साप्ताहिक पेमेंट तपशील (Weekly Payments Breakdown)
          </h2>
          <span class="section-meta">
            एकूण ${sortedWeeklyGroups.length} आठवडे • ${payments.length} नोंदी
          </span>
        </div>

        ${weeklyTablesHtml}

        <!-- Grand Total Card -->
        <div class="grand-total-card">
          <div class="grand-total-row">
            <span>एकूण सर्व साप्ताहिक भरणा (Total Disbursed Amount):</span>
            <span class="grand-total-amount">₹${totalPaymentFmt}</span>
          </div>
          <div class="in-words-row">
            <span><strong>अक्षरी रक्कम:</strong> ${marathiWords}</span>
            <span class="font-mono text-muted">शिल्लक बाकी: ₹${remainingFmt}</span>
          </div>
        </div>
      </section>

      <!-- 5. Signatures and Stamp Box -->
      <section class="signatures-container">
        <div class="sig-box">
          <div style="height: 35px;"></div>
          कामगार / आल्यावाले स्वाक्षरी किंवा अंगठा
          <div class="sig-sub">(${workerNameSafe})</div>
        </div>

        <div class="sig-box">
          <div style="height: 35px;"></div>
          मुकादम / हिशोब तपासणीस स्वाक्षरी
          <div class="sig-sub">(पैसे देणारा / पर्यवेक्षक)</div>
        </div>

        <div class="sig-box">
          <div style="height: 35px;"></div>
          विटभट्टी मालक / अधिकृत शिक्का व सही
          <div class="sig-sub">(विशाल विटभट्टी उद्योजक)</div>
        </div>
      </section>

      <!-- 6. Legal & Audit Notice -->
      <footer class="sheet-footer">
        <p>• ही पावती संगणकीय प्रणालीद्वारे (BrickSetu) तयार करण्यात आली असून अधिकृत साप्ताहिक नोंदीशी पडताळली आहे.</p>
        <p>• या पावतीमधील रकमेबाबत अथवा साप्ताहिक नोंदीबाबत काही आक्षेप असल्यास कृपया त्वरित विटभट्टी व्यवस्थापनाशी संपर्क साधावा.</p>
      </footer>
    </article>
  </main>

  <script>
    const whatsappSummary = ${whatsappSummaryEscaped};

    function copyWhatsAppSummary() {
      navigator.clipboard.writeText(whatsappSummary).then(() => {
        const btn = document.getElementById("btnWhatsappCopy");
        if (btn) {
          const original = btn.innerHTML;
          btn.innerHTML = "✅ कॉपी झाले!";
          btn.style.background = "#059669";
          setTimeout(() => {
            btn.innerHTML = original;
            btn.style.background = "";
          }, 2500);
        }
      }).catch((e) => {
        alert("मजकूर कॉपी करण्यात त्रुटी आली: " + e.message);
      });
    }

    function downloadPdfDirectly() {
      const btn = document.getElementById("btnDownload");
      const originalHtml = btn ? btn.innerHTML : "";

      async function executeSave() {
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = "⏳ PDF डाऊनलोड होत आहे...";
        }

        try {
          if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
          }
        } catch (_) {}

        const element = document.getElementById("pdf-sheet-content");
        const filename = "साप्ताहिक_पेमेंट_पावती_" + ${JSON.stringify(workerNameSafe)} + "_" + ${JSON.stringify(todayStr)} + ".pdf";

        const opt = {
          margin: [8, 8, 8, 8],
          filename: filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0,
            logging: false,
            letterRendering: false
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
          },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] }
        };

        html2pdf()
          .set(opt)
          .from(element)
          .save()
          .then(() => {
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = "✅ PDF डाऊनलोड झाली!";
              btn.style.background = "#15803d";
              setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.style.background = "";
              }, 3000);
            }
          })
          .catch((err) => {
            console.error("PDF generation error:", err);
            alert("PDF डाऊनलोड करताना त्रुटी आली: " + (err.message || err));
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = originalHtml;
            }
          });
      }

      if (typeof html2pdf === "undefined") {
        if (btn) btn.innerHTML = "⏳ लायब्ररी लोड होत आहे...";
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";
        script.onload = executeSave;
        script.onerror = () => {
          alert("PDF लायब्ररी लोड करण्यात अडचण आली. कृपया इंटरनेट तपासा किंवा पुन्हा प्रयत्न करा.");
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
          }
        };
        document.head.appendChild(script);
      } else {
        executeSave();
      }
    }
  </script>
</body>
</html>`;
}


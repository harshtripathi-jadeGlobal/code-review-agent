import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Export the code review result as a professionally styled PDF.
 */
export function exportReviewPdf(result) {
  const {
    issues = [],
    score = 0,
    summary = '',
    critical_count = 0,
    warning_count = 0,
    info_count = 0,
    language = 'unknown',
  } = result

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 16
  const contentW = pageW - margin * 2
  let y = 16

  // ── Colors ──
  const dark = [13, 16, 23]       // #0d1017
  const accent = [59, 130, 246]   // blue-500
  const criticalC = [239, 68, 68]
  const warningC = [245, 158, 11]
  const infoC = [59, 130, 246]
  const textLight = [226, 232, 240]
  const textMuted = [148, 163, 184]

  // ── Full-page dark background ──
  doc.setFillColor(...dark)
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), 'F')

  // ── Header ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...accent)
  doc.text('CODEWATCH', margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...textMuted)
  doc.text('AI Code Review Report', margin + 52, y)

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  doc.text(dateStr, pageW - margin, y, { align: 'right' })
  y += 4

  // ── Divider ──
  doc.setDrawColor(...accent)
  doc.setLineWidth(0.6)
  doc.line(margin, y, pageW - margin, y)
  y += 10

  // ── Score section ──
  // Score circle (simulated)
  const scoreColor = score >= 80 ? [34, 197, 94] : score >= 50 ? warningC : criticalC
  doc.setFillColor(...scoreColor)
  doc.circle(margin + 12, y + 6, 10, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text(String(Math.round(score)), margin + 12, y + 8, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...textMuted)
  doc.text('Quality Score', margin + 12, y + 17, { align: 'center' })

  // Severity counts
  const counters = [
    { label: 'Critical', count: critical_count, color: criticalC },
    { label: 'Warning', count: warning_count, color: warningC },
    { label: 'Info', count: info_count, color: infoC },
  ]

  const counterStartX = margin + 40
  const counterW = 30
  counters.forEach((c, i) => {
    const cx = counterStartX + i * (counterW + 8)
    // Badge background
    doc.setFillColor(c.color[0], c.color[1], c.color[2])
    doc.roundedRect(cx, y - 2, counterW, 18, 3, 3, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(255, 255, 255)
    doc.text(String(c.count), cx + counterW / 2, y + 7, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(255, 255, 255)
    doc.text(c.label.toUpperCase(), cx + counterW / 2, y + 13, { align: 'center' })
  })

  // Language badge
  doc.setFillColor(40, 50, 70)
  const langText = language.toUpperCase()
  doc.roundedRect(pageW - margin - 30, y - 2, 30, 12, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...accent)
  doc.text(langText, pageW - margin - 15, y + 5, { align: 'center' })

  y += 26

  // ── Summary ──
  if (summary) {
    doc.setFillColor(18, 22, 32)
    doc.roundedRect(margin, y, contentW, 0, 3, 3, 'F') // placeholder, will resize

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...textLight)
    doc.text('Summary', margin + 4, y + 6)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...textMuted)
    const summaryLines = doc.splitTextToSize(summary, contentW - 8)
    doc.text(summaryLines, margin + 4, y + 12)

    const summaryH = 16 + summaryLines.length * 4
    doc.setFillColor(18, 22, 32)
    doc.roundedRect(margin, y, contentW, summaryH, 3, 3, 'F')
    // Re-draw text on top
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...textLight)
    doc.text('Summary', margin + 4, y + 6)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...textMuted)
    doc.text(summaryLines, margin + 4, y + 12)

    y += summaryH + 6
  }

  // ── Issues table ──
  if (issues.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...textLight)
    doc.text('Issues', margin, y + 2)
    y += 6

    const sevColor = (sev) => {
      if (sev === 'critical') return criticalC
      if (sev === 'warning') return warningC
      return infoC
    }

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Severity', 'Category', 'Title', 'Description', 'Fix Suggestion']],
      body: issues.map((iss, i) => [
        i + 1,
        (iss.severity || 'info').toUpperCase(),
        (iss.category || 'style'),
        iss.title || '',
        iss.description || '',
        iss.fix_suggestion || '',
      ]),
      styles: {
        fontSize: 7.5,
        cellPadding: 3,
        textColor: [200, 210, 225],
        fillColor: [16, 20, 30],
        lineColor: [40, 50, 70],
        lineWidth: 0.3,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [25, 35, 55],
        textColor: [...accent],
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [20, 26, 38],
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        // Color severity cells
        if (data.section === 'body' && data.column.index === 1) {
          const sev = data.cell.raw?.toLowerCase?.() || ''
          if (sev === 'CRITICAL') data.cell.styles.textColor = criticalC
          else if (sev === 'WARNING') data.cell.styles.textColor = warningC
          else data.cell.styles.textColor = infoC
        }
      },
      didDrawPage: (data) => {
        // Redraw dark background on new pages
        doc.setFillColor(...dark)
        doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), 'F')
      },
      willDrawPage: (data) => {
        doc.setFillColor(...dark)
        doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), 'F')
      },
    })

    y = doc.lastAutoTable.finalY + 8
  }

  // ── Code Before / After for each issue ──
  issues.forEach((iss, i) => {
    if (!iss.code_before && !iss.code_after) return

    // Page break check
    if (y > doc.internal.pageSize.getHeight() - 50) {
      doc.addPage()
      doc.setFillColor(...dark)
      doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), 'F')
      y = 16
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...textLight)
    doc.text(`${i + 1}. ${iss.title || 'Issue'} — Code Diff`, margin, y)
    y += 5

    if (iss.code_before) {
      doc.setFillColor(30, 15, 15)
      const lines = doc.splitTextToSize(iss.code_before, contentW - 8)
      const blockH = Math.max(8, lines.length * 3.5 + 6)
      doc.roundedRect(margin, y, contentW, blockH, 2, 2, 'F')
      doc.setFont('courier', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(240, 130, 130)
      doc.text('— ' + lines.join('\n'), margin + 4, y + 4)
      y += blockH + 2
    }

    if (iss.code_after) {
      doc.setFillColor(15, 30, 15)
      const lines = doc.splitTextToSize(iss.code_after, contentW - 8)
      const blockH = Math.max(8, lines.length * 3.5 + 6)
      doc.roundedRect(margin, y, contentW, blockH, 2, 2, 'F')
      doc.setFont('courier', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(130, 240, 130)
      doc.text('+ ' + lines.join('\n'), margin + 4, y + 4)
      y += blockH + 2
    }

    y += 4
  })

  // ── Footer on every page ──
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFillColor(...dark)
    const ph = doc.internal.pageSize.getHeight()
    doc.setDrawColor(40, 50, 70)
    doc.setLineWidth(0.3)
    doc.line(margin, ph - 10, pageW - margin, ph - 10)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...textMuted)
    doc.text('Generated by Codewatch — AI Code Review Agent', margin, ph - 5)
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, ph - 5, { align: 'right' })
  }

  // ── Save ──
  const filename = `codewatch-review-${language}-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}

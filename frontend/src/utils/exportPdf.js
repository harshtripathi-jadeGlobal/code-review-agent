import jsPDF from 'jspdf'

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
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 16
  const contentW = pageW - margin * 2
  let y = 16

  // ── Colors ──
  const accent = [37, 99, 235]       // base blue
  const criticalC = [239, 68, 68]
  const warningC = [245, 158, 11]
  const infoC = [59, 130, 246]
  const textDark = [15, 23, 42]      // slate-900
  const textMuted = [100, 116, 139]  // slate-500
  const borderC = [226, 232, 240]    // slate-200
  const bgCard = [248, 250, 252]     // slate-50
  
  // Custom helpers
  const checkPageBreak = (neededHeight) => {
    if (y + neededHeight > pageH - 20) {
      doc.addPage()
      y = 16
    }
  }

  // ── Header ──
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...accent)
  doc.text('CODESAGE', margin, y)

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
  doc.setDrawColor(...borderC)
  doc.setLineWidth(0.4)
  doc.line(margin, y, pageW - margin, y)
  y += 10

  // ── Score section ──
  const scoreColor = score >= 80 ? [34, 197, 94] : score >= 50 ? warningC : criticalC
  doc.setFillColor(...scoreColor)
  doc.circle(margin + 12, y + 6, 10, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text(String(Math.round(score)), margin + 12, y + 8, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...textDark)
  // Place label fully below the score circle (circle bottom ~ y+16).
  doc.text('Quality Score', margin + 12, y + 22, { align: 'center' })

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
    
    // Light bounding box
    doc.setDrawColor(...c.color)
    doc.setFillColor(255, 255, 255)
    doc.setLineWidth(0.3)
    doc.roundedRect(cx, y - 2, counterW, 18, 3, 3, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...c.color)
    doc.text(String(c.count), cx + counterW / 2, y + 7, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.text(c.label.toUpperCase(), cx + counterW / 2, y + 13, { align: 'center' })
  })

  // Language badge
  doc.setFillColor(...bgCard)
  doc.setDrawColor(...borderC)
  doc.setLineWidth(0.3)
  const langText = language.toUpperCase()
  doc.roundedRect(pageW - margin - 30, y - 2, 30, 12, 2, 2, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...accent)
  doc.text(langText, pageW - margin - 15, y + 5, { align: 'center' })

  y += 24

  // ── Summary ──
  if (summary) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...textDark)
    const summaryLines = doc.splitTextToSize(summary, contentW - 8)
    const summaryH = 12 + summaryLines.length * 4
    
    checkPageBreak(summaryH + 10)

    doc.setFillColor(...bgCard)
    doc.setDrawColor(...borderC)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, y, contentW, summaryH, 3, 3, 'FD')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Summary', margin + 4, y + 7)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...textDark)
    doc.text(summaryLines, margin + 4, y + 13)

    y += summaryH + 8
  }

  // ── Issues Detailed List ──
  if (issues.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...textDark)
    doc.text('Detailed Findings', margin, y + 4)
    y += 8

    issues.forEach((iss, i) => {
      // Basic measurements
      const maxTextW = contentW - 8
      let blockH = 14 // Base padding
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      const titleLines = doc.splitTextToSize(`${i + 1}. ${iss.title || 'Issue'}`, maxTextW - 35) // leave room for badges
      blockH += titleLines.length * 4.5
      
      let descLines = []
      if (iss.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        descLines = doc.splitTextToSize(iss.description, maxTextW)
        blockH += descLines.length * 4.5 + 4
      }

      let fixLines = []
      if (iss.fix_suggestion) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(9)
        fixLines = doc.splitTextToSize(iss.fix_suggestion, maxTextW - 4)
        blockH += fixLines.length * 4.5 + 10
      }

      let beforeLines = []
      if (iss.code_before) {
        doc.setFont('courier', 'normal')
        doc.setFontSize(8)
        beforeLines = doc.splitTextToSize(iss.code_before, maxTextW - 4)
        blockH += beforeLines.length * 4 + 8 /* label */ + 4
      }

      let afterLines = []
      if (iss.code_after) {
        doc.setFont('courier', 'normal')
        doc.setFontSize(8)
        afterLines = doc.splitTextToSize(iss.code_after, maxTextW - 4)
        blockH += afterLines.length * 4 + 8 /* label */ + 4
      }

      checkPageBreak(blockH + 5)

      // Draw Issue Container
      doc.setFillColor(...bgCard)
      doc.setDrawColor(...borderC)
      doc.setLineWidth(0.3)
      doc.roundedRect(margin, y, contentW, blockH, 3, 3, 'FD')
      let cy = y + 7

      // Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...textDark)
      doc.text(titleLines, margin + 4, cy)
      cy += titleLines.length * 4.5

      // Badges
      const sevColor = iss.severity === 'critical' ? criticalC : iss.severity === 'warning' ? warningC : infoC
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      
      const badgeW = 20
      const bx = margin + contentW - badgeW - 4
      doc.setDrawColor(...sevColor)
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(bx, y + 3, badgeW, 6, 1.5, 1.5, 'FD')
      doc.setTextColor(...sevColor)
      doc.text((iss.severity || 'info').toUpperCase(), bx + badgeW / 2, y + 7.5, { align: 'center' })

      if (iss.line_number) {
        const lineText = `L${iss.line_number}`
        const lx = bx - 14 - 4
        doc.setDrawColor(...textMuted)
        doc.roundedRect(lx, y + 3, 14, 6, 1.5, 1.5, 'FD')
        doc.setTextColor(...textMuted)
        doc.text(lineText, lx + 7, y + 7.5, { align: 'center' })
      }

      // Description
      if (descLines.length > 0) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...textDark)
        doc.text(descLines, margin + 4, cy)
        cy += descLines.length * 4.5 + 4
      }

      // Fix
      if (fixLines.length > 0) {
        doc.setFillColor(254, 252, 232) // yellow-50
        doc.setDrawColor(254, 240, 138) // yellow-200
        const fh = fixLines.length * 4.5 + 6
        doc.roundedRect(margin + 4, cy, contentW - 8, fh, 2, 2, 'FD')
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(161, 98, 7) // yellow-700
        doc.text('SUGGESTED FIX', margin + 6, cy + 5)
        
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(9)
        doc.text(fixLines, margin + 6, cy + 10)
        cy += fh + 4
      }

      // Code Before
      if (beforeLines.length > 0) {
        doc.setFillColor(254, 242, 242) // red-50
        doc.setDrawColor(254, 202, 202) // red-200
        const ch = beforeLines.length * 4 + 7
        doc.roundedRect(margin + 4, cy, contentW - 8, ch, 2, 2, 'FD')
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(220, 38, 38) // red-600
        doc.text('BEFORE', margin + 6, cy + 4)
        
        doc.setFont('courier', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(153, 27, 27) // red-800
        doc.text(beforeLines, margin + 6, cy + 9)
        cy += ch + 4
      }

      // Code After
      if (afterLines.length > 0) {
        doc.setFillColor(240, 253, 244) // green-50
        doc.setDrawColor(187, 247, 208) // green-200
        const ch = afterLines.length * 4 + 7
        doc.roundedRect(margin + 4, cy, contentW - 8, ch, 2, 2, 'FD')
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(22, 163, 74) // green-600
        doc.text('AFTER', margin + 6, cy + 4)
        
        doc.setFont('courier', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(22, 101, 52) // green-800
        doc.text(afterLines, margin + 6, cy + 9)
        cy += ch + 4
      }

      y += blockH + 6
    })
  }

  // ── Footer on every page ──
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setDrawColor(...borderC)
    doc.setLineWidth(0.4)
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...textMuted)
    doc.text('Generated by CodeSage — AI Code Review Agent', margin, pageH - 7)
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 7, { align: 'right' })
  }

  // ── Save ──
  const finalFilename = `codesage-review-${language}-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(finalFilename)
}

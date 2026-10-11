import { dateFr } from './format'

function download(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* config = { fileName, title, columns: [{ header, key, width }], rows: [{...}] } */

export async function exportExcel({ fileName, title, columns, rows }) {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet((title || 'Données').slice(0, 31))

  sheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width || 22 }))
  sheet.addRows(rows)

  const head = sheet.getRow(1)
  head.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF17243B' } }
  head.alignment = { vertical: 'middle' }
  head.height = 22
  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  const buffer = await workbook.xlsx.writeBuffer()
  download(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${fileName}.xlsx`
  )
}

export async function exportPdf({ fileName, title, columns, rows }) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const doc = new jsPDF({ orientation: columns.length > 5 ? 'landscape' : 'portrait' })

  doc.setFontSize(20)
  doc.setTextColor(23, 36, 59)
  doc.text('CoursPlus', 14, 18)
  doc.setFontSize(12)
  doc.text(title, 14, 26)
  doc.setFontSize(9)
  doc.setTextColor(110)
  doc.text(`Généré le ${dateFr(new Date(), true)} - ${rows.length} ligne(s)`, 14, 32)

  autoTable(doc, {
    startY: 38,
    head: [columns.map(c => c.header)],
    body: rows.map(r => columns.map(c => r[c.key] ?? '')),
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [23, 36, 59] },
    alternateRowStyles: { fillColor: [248, 247, 244] },
    didDrawPage: () => {
      const { width, height } = doc.internal.pageSize
      doc.setFontSize(8)
      doc.setTextColor(140)
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, width - 14, height - 8, { align: 'right' })
    }
  })

  doc.save(`${fileName}.pdf`)
}

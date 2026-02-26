import { requestOtpForCustomer } from '../api/customer';
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

export const generateLoanPDF = async (formData: any) => {
  try {
    // 1. ໂຫຼດ PDF ຕົ້ນສະບັບ (ໄຟລ໌ທີ່ທ່ານແນບມາ)
    const existingPdfBytes = await fetch('/templates/requestform.pdf').then(res => res.arrayBuffer())

    // 2. ໂຫຼດ Font ພາສາລາວ (ສຳຄັນຫຼາຍ)
    const fontBytes = await fetch('/fonts/phetsarath_ot.ttf').then(res => res.arrayBuffer())

    // 3. ສ້າງ PDF Document
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    pdfDoc.registerFontkit(fontkit)
    const laoFont = await pdfDoc.embedFont(fontBytes)

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    // Function ຊ່ວຍວາງ Text ງ່າຍໆ
    const draw = (text: string, x: number, y: number, size = 10) => {
      if (!text) return
      firstPage.drawText(text, {
        x,
        y: height - y, // ແກ້ໄຂ Coordinate ຈາກເທິງລົງລຸ່ມ
        size,
        font: laoFont,
        color: rgb(0, 0, 0),
      })
    }

    // --- ເລີ່ມວາງຂໍ້ມູນຕາມຈຸດ (ຕົວເລກ x, y ຕ້ອງປັບຕາມໄຟລ໌ຈິງຂອງທ່ານ) ---

    // Checkbox: ອອນລາຍ / ອ໋ອບລາຍ [cite: 5, 6]
    if (formData.applyType === 'online') draw('X', 185, 148, 14)
    else draw('X', 245, 148, 14)

    // I. ຂໍ້ມູນລູກຄ້າ [cite: 13, 14, 15]
    draw(formData.customer.fullname, 180, 222)
    draw(formData.customer.dob, 145, 238)
    draw(formData.customer.age?.toString(), 305, 238)
    draw(formData.customer.occupation, 375, 238)
    draw(formData.customer.phone, 125, 254)
    draw(formData.customer.address.village, 290, 254)
    draw(formData.customer.address.district, 455, 254)

    // III. ລາຍລະອຽດສິນຄ້າ (ໃນຕາຕະລາງ) [cite: 43, 44]
    draw(formData.product.type, 130, 435)        // 1. ປະເພດສິນຄ້າ
    draw(formData.product.price, 130, 465)       // 2. ລາຄາ
    draw(formData.product.brand, 310, 435)       // 7. ຍີ່ຫໍ້
    draw(formData.product.loanTerm, 130, 495)    // 3. ໄລຍະເວລາກູ້
    draw(formData.product.interestRate, 335, 480) // 9. ດອກເບ້ຍ

    // IV. ຂໍ້ມູນຜູ້ຄ້ຳປະກັນ [cite: 45, 48, 49]
    draw(formData.guarantor.name, 180, 615)
    draw(formData.guarantor.phone, 125, 645)

    // ລາຍເຊັນ ແລະ ວັນທີ [cite: 71, 74, 77]
    const today = new Date().toLocaleDateString('lo-LA')
    draw(today, 100, 830) // ວັນທີຜູ້ກູ້
    draw(today, 270, 830) // ວັນທີຜູ້ຄ້ຳ
    draw(today, 450, 830) // ວັນທີພະນັກງານ

    // 4. Save ແລະ ສັ່ງ Download
    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `Loan_Request_${formData.customer.fullname}.pdf`
    link.click()

  } catch (error) {
    console.error('PDF Generation Error:', error)
  }
}

// src/utils/alert.ts
import Swal from 'sweetalert2';

// 1. สร้าง Base Mixin เพื่อตั้งค่า Default และครอบด้วย Class ของ Tailwind / DaisyUI
const BaseSwal = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-primary px-6 mx-2',    // ปุ่มตกลง
    cancelButton: 'btn btn-soft btn-secondary px-6 mx-2', // ปุ่มยกเลิก
    popup: 'rounded-2xl', // ขอบมน
  },
  buttonsStyling: false, // บังคับให้ใช้ Style ของ Class ด้านบนแทน
});

// 2. สร้าง Wrapper Object เพื่อเรียกใช้งานง่ายๆ
export const alert = {
  /**
   * แจ้งเตือนเมื่อสำเร็จ (ปิดเองอัตโนมัติใน 2 วินาที)
   */
  success(title: string, text: string = '') {
    return BaseSwal.fire({
      icon: 'success',
      title,
      text,
      showConfirmButton: false,
      timer: 2000,
    });
  },
  /**
   * 🌟 เพิ่มฟังก์ชันแจ้งเตือนแบบเตือน (Warning)
   */
  warning(title: string, text: string = '') {
    return BaseSwal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'ຕົກລົງ',
    });
  },

  /**
   * แจ้งเตือนข้อผิดพลาด (ต้องกดปิดเอง)
   */
  error(title: string = 'ເກີດຂໍ້ຜິດພາດ', text: string = '') {
    return BaseSwal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'ປິດ',
    });
  },

  /**
   * แจ้งเตือนทั่วไป (Info)
   */
  info(title: string, text: string = '') {
    return BaseSwal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonText: 'ຕົກລົງ',
    });
  },

  /**
   * กล่องข้อความถามยืนยัน (Confirm Dialog)
   * @returns {Promise<boolean>} คืนค่า true ถ้ากดยืนยัน, false ถ้ากดยกเลิก
   */
  async confirm(
    title: string,
    htmlText: string = '',
    confirmBtnText: string = 'ຕົກລົງ',
    cancelBtnText: string = 'ຍົກເລີກ'
  ): Promise<boolean> {
    const result = await BaseSwal.fire({
      icon: 'warning',
      title,
      html: htmlText, // รองรับ HTML เช่น <b>, <br>
      showCancelButton: true,
      confirmButtonText: confirmBtnText,
      cancelButtonText: cancelBtnText,
      reverseButtons: true, // สลับตำแหน่งปุ่ม (ยกเลิกอยู่ซ้าย ตกลงอยู่ขวา)
    });
    return result.isConfirmed;
  },
  async prompt(title: string, htmlText: string, inputPlaceholder: string = ''): Promise<string | null> {
    const result = await BaseSwal.fire({
      icon: 'warning', title, html: htmlText, input: 'text', inputPlaceholder,
      showCancelButton: true, confirmButtonText: 'ຢືນຢັນ', cancelButtonText: 'ຍົກເລີກ',
      reverseButtons: true,
      inputValidator: (value) => {
        if (!value) return 'ກະລຸນາປ້ອນຂໍ້ມູນກ່ອນຢືນຢັນ!';
      }
    });
    return result.isConfirmed ? result.value : null;
  },

  /**
   * แสดงหน้าจอ Loading บล็อกไม่ให้ผู้ใช้กดอย่างอื่น
   */
  showLoading(title: string = 'ກຳລັງປະມວນຜົນ...') {
    BaseSwal.fire({
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  /**
   * สั่งปิดหน้าต่าง Alert หรือ Loading ปัจจุบัน
   */
  close() {
    Swal.close();
  }
};

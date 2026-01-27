// src/directives/can.ts
import type { Directive } from 'vue'
import { usePermissionStore } from '../stores/permission'

/**
 * v-can="'create_loan'"
 * v-can="['create_loan', 'approve_loan']" → ต้องมีอย่างน้อย 1 สิทธิ์
 */
const canDirective: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const permissionStore = usePermissionStore()
    const required = binding.value

    let hasAccess = false

    if (typeof required === 'string') {
      hasAccess = permissionStore.hasPermission(required)
    } else if (Array.isArray(required)) {
      hasAccess = required.some(permission =>
        permissionStore.hasPermission(permission)
      )
    }

    if (!hasAccess) {
      // ลบ element ออกจาก DOM (ปลอดภัยกว่า display: none)
      el.remove()
    }
  }
}

export default canDirective

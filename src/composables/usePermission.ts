// src/composables/usePermission.ts
import { usePermissionStore } from '@/stores/permission'

export function usePermission() {
  const permissionStore = usePermissionStore()

  const can = (permission: string): boolean => {
    return permissionStore.hasPermission(permission)
  }

  const canAny = (permissions: string[]): boolean => {
    return permissions.some(p => permissionStore.hasPermission(p))
  }

  return {
    can,
    canAny
  }
}

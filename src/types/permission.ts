// src/types/permission.ts
export interface Feature {
  id: number
  feature_name: string
  description: string | null
}

export interface UserPermission {
  user_id: number
  feature_id: number
  can_access: number
  feature: Feature
}

export interface UserWithPermissions {
  user_id: number
  permissions: UserPermission[]
}

export interface PermissionAssignment {
  user_id: number
  feature_ids: number[]
}

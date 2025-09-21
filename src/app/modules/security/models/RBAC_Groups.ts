import { componentRegister } from "app/modules/shared/services/component-register";


export class RBAC_Groups {
  ID: number = 0;
  Name: string = '';
  IsAdmin: boolean | null = null;
  IsGlobalAdmin: boolean | null = null;
  IsActive: boolean | null = true;
  SCode: string = componentRegister.group.SCode;
  RBAC_Module_Permissions: RBAC_Module_Permissions[] = [];
  RBAC_Section_Permissions: RBAC_Section_Permissions[] = [];
}

export class RBAC_Module_Permissions {
  ID: number = 0;
  GroupID: number | null = null;
  ModuleID: number | null = null;
  IsAccess: boolean | null = null;
  IsSystemGenerated: boolean | null = null;
}

export class RBAC_Section_Permissions {
  ID: number = 0;
  GroupID: number | null = null;
  SectionID: number | null = null;
  RightID: number | null = null;
  IsSystemGenerated: boolean | null = null;
}

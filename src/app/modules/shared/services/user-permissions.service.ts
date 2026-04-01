import { Injectable } from '@angular/core';
import { LoginUser } from 'app/core/user/user.types';
import { Permission } from '../enums/permission';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionsService {

  constructor() { }

  isAddSectionAccessible(scode: string): boolean {
    if (!scode) return false;
    return LoginUser.SectionAccess.some(a => a.SCode == scode && a.RightID === Permission.Add);
  }

  isViewSectionAccessible(scode: string): boolean {
    if (!scode) return false;
    return LoginUser.SectionAccess.some(a => a.SCode == scode && a.RightID === Permission.View);
  }

  isEditSectionAccessible(scode: string): boolean {
    if (!scode) return false;
    return LoginUser.SectionAccess.some(a => a.SCode == scode && a.RightID === Permission.Update);
  }

  isDeleteSectionAccessible(scode: string): boolean {
    if (!scode) return false;
    return LoginUser.SectionAccess.some(a => a.SCode == scode && a.RightID === Permission.Delete);
  }
}

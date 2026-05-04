import { Injectable } from '@angular/core';
import { LoginUser } from 'app/core/user/user.types';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { Permission } from '../enums/permission';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionsService {

  constructor(private _localStorage: LocalStorageService) { }

  private get isAdmin(): boolean {
    return this._localStorage.isAdmin === 'true' || this._localStorage.isGlobalAdmin === 'true';
  }

  isAddSectionAccessible(scode: string): boolean {
    if (!scode) return false;
    if (this.isAdmin) return true;
    return LoginUser.SectionAccess.some(a => a.SCode == scode && a.RightID === Permission.Add);
  }

  isViewSectionAccessible(scode: string): boolean {
    if (!scode) return false;
    if (this.isAdmin) return true;
    return LoginUser.SectionAccess.some(a => a.SCode == scode && a.RightID === Permission.View);
  }

  isEditSectionAccessible(scode: string): boolean {
    if (!scode) return false;
    if (this.isAdmin) return true;
    return LoginUser.SectionAccess.some(a => a.SCode == scode && a.RightID === Permission.Update);
  }

  isDeleteSectionAccessible(scode: string): boolean {
    if (!scode) return false;
    if (this.isAdmin) return true;
    return LoginUser.SectionAccess.some(a => a.SCode == scode && a.RightID === Permission.Delete);
  }
}

import { Injectable } from '@angular/core';
import { LoginUser } from 'app/core/user/user.types';
import { Permission } from '../enums/permission';

@Injectable({
  providedIn: 'root'
})
export class UserPermissionsService {

  constructor() { }

  isAddSectionAccessible(scode: string): boolean {
    if(scode == null || scode == undefined || scode == ''){
      return false;
    }
    let filterSectionAccess = LoginUser.SectionAccess.filter(a=> a.SCode == scode && a.RightID === Permission.Add);
    if(filterSectionAccess.length > 0) {
      return true;
    }
    else{
      false
    }
  }
  isViewSectionAccessible(scode: string): boolean {
    if(scode == null || scode == undefined || scode == ''){
      return false;
    }
    let filterSectionAccess = LoginUser.SectionAccess.filter(a=> a.SCode == scode && a.RightID === Permission.View);
    if(filterSectionAccess.length > 0) {
      return true;
    }
    else{
      false
    }
  }

  isEditSectionAccessible(scode: string): boolean {
    if(scode == null || scode == undefined || scode == ''){
      return false;
    }
    let filterSectionAccess = LoginUser.SectionAccess.filter(a=> a.SCode == scode && a.RightID === Permission.Update);
    if(filterSectionAccess.length > 0) {
      return true;
    }
    else{
      false
    }
  }

  isDeleteSectionAccessible(scode: string): boolean {
    if(scode == null || scode == undefined || scode == ''){
      return false;
    }
    let filterSectionAccess = LoginUser.SectionAccess.filter(a=> a.SCode == scode && a.RightID === Permission.Delete);
    if(filterSectionAccess.length > 0) {
      return true;
    }
    else{
      false
    }
  }
}

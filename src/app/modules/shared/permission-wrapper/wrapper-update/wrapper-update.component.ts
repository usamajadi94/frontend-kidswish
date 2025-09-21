import { Component, Input } from '@angular/core';
import { UserPermissionsService } from '../../services/user-permissions.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'wrapper-update',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './wrapper-update.component.html',
  styleUrl: './wrapper-update.component.scss'
})
export class WrapperUpdateComponent {
 @Input() SCode:string = null;

  constructor(public permissionService:UserPermissionsService){}
}

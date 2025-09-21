import { Component, Input } from '@angular/core';
import { UserPermissionsService } from '../../services/user-permissions.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'wrapper-delete',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './wrapper-delete.component.html',
  styleUrl: './wrapper-delete.component.scss'
})
export class WrapperDeleteComponent {

 @Input() SCode:string = null;

  constructor(public permissionService:UserPermissionsService){}
}

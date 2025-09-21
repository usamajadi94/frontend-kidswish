import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { UserPermissionsService } from '../../services/user-permissions.service';

@Component({
  selector: 'wrapper-add',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './wrapper-add.component.html',
  styleUrl: './wrapper-add.component.scss'
})
export class WrapperAddComponent {
  @Input() SCode:string = null;

  constructor(public permissionService:UserPermissionsService){}
}

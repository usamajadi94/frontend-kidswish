import { Component, Input } from '@angular/core';
import { UserPermissionsService } from '../../services/user-permissions.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'wrapper-view',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './wrapper-view.component.html',
  styleUrl: './wrapper-view.component.scss'
})
export class WrapperViewComponent {
 @Input() SCode:string = null;

  constructor(public permissionService:UserPermissionsService){}
}


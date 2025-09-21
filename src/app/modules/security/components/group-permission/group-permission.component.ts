import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { GroupPermission } from '../../models/group-permission';
import { EntityPermission } from '../../models/group-permission';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';

@Component({
  selector: 'app-group-permission',
  standalone: true,
  imports: [
    NzTableModule,
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTabsModule,
    BftCheckboxComponent
  ],
  templateUrl: './group-permission.component.html',
  styleUrl: './group-permission.component.scss'
})
export class GroupPermissionComponent extends BaseComponent<
  GroupPermission,
  GroupPermissionComponent
> {
  constructor(
    private genSer: GenericService,
    private msgSer: MessageModalService,
    private modalSer: ModalService,
    private toasterSer: ToastService,
    public activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
    // this.setControllerName();
    this.setFormTitle('Group Permission');
    
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  public override InitializeObject(): void {
    this.formData = new GroupPermission();
  }

  selectedTabIndex = 0;


  override ValidateBeforeSave(formData: GroupPermission): boolean {
    this.validation = [];

    const hasAnyPermission = formData.groups.some(group =>
      group.permissions.some(p => p.create || p.read || p.write || p.delete)
    );

    if (!hasAnyPermission) {
      this.validation.push('Please select at least one permission.');
    }

    return this.validation.length > 0;
  }

  setAll(permission: EntityPermission, value: boolean): void {
    permission.create = value;
    permission.read = value;
    permission.write = value;
    permission.delete = value;
    this.cdr.detectChanges();
  }

  isAllChecked(permission: EntityPermission): boolean {
    return permission.create && permission.read && permission.write && permission.delete;
  }

}






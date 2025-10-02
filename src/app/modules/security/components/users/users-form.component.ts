import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputEmailComponent } from 'app/modules/shared/components/fields/bft-input-email/bft-input-email.component';
import { BftInputPasswordComponent } from 'app/modules/shared/components/fields/bft-input-password/bft-input-password.component';
import { BftInputPhoneComponent } from 'app/modules/shared/components/fields/bft-input-phone/bft-input-phone.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BftButtonComponent } from '../../../shared/components/buttons/bft-button/bft-button.component';
import { BftCheckboxComponent } from '../../../shared/components/fields/bft-checkbox/bft-checkbox.component';
import { RBAC_User_Entity_Groups, Rbac_User } from '../../models/RBAC_User';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-users-form',
    standalone: true,
    imports: [
        MatButtonModule,
        MatStepperModule,
        BftInputTextComponent,
        MatIconModule,
        BftInputEmailComponent,
        BftInputPhoneComponent,
        BftTextareaComponent,
        FormsModule,
        BftInputPasswordComponent,
        BftCheckboxComponent,
        BftButtonComponent,
        NgClass
    ],
    templateUrl: './users-form.component.html',
    styleUrl: './users-form.component.scss',
})
export class UsersFormComponent extends BaseComponent<
    Rbac_User,
    UsersFormComponent
> {
    private _listService = inject(ListService);
    permissionGroups = [];
    selectedCount = 0;

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.userController);
        this.setFormTitle(componentRegister.user.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override async BeforeInit(): Promise<void> {
        this.getGroupsData();
    }

    public override InitializeObject(): void {
        this.formData = new Rbac_User();
    }

    getGroupsData() {
        this._listService.getGroups().subscribe({
            next: (res: any) => {
                this.permissionGroups = res;
                console.log('permission Res', this.permissionGroups);
            },
            error: (err) => {
                console.error('Error fetching Opening Stock:', err);
            },
        });
    }

    override ValidateBeforeSave(formData: Rbac_User): boolean {
        this.validation = [];
        if (formData.FirstName == null || formData.FirstName.trim() == '') {
            this.validation.push('First Name is required.');
        }
        if (formData.LastName == null || formData.LastName.trim() == '') {
            this.validation.push('Last Name is required.');
        }
        if (formData.UserName == null || formData.UserName.trim() == '') {
            this.validation.push('User Name is required.');
        }
        if (formData.Password == null || formData.Password.trim() == '') {
            this.validation.push('Password is required.');
        }
        if (formData.Email == null || formData.Email.trim() == '') {
            this.validation.push('Email is required.');
        }
        return this.validation.length > 0;
    }

    updateSelectedCount() {
        this.selectedCount = this.permissionGroups.filter(
            (g) => g.selected
        ).length;
    }

    public BeforeUpSert(formData: Rbac_User): void {
        formData.RBAC_User_Entity_Groups = [];
        this.permissionGroups.forEach((element) => {
            if (element.selected) {
                var permissions: RBAC_User_Entity_Groups = {
                    ID: 0,
                    GroupID: element.ID,
                    UserID: 0,
                };
                formData.RBAC_User_Entity_Groups.push(permissions);
            }
        });
    }
    
    public AfterGetData(): void {
        const permission = this.formData.RBAC_User_Entity_Groups;
        permission.forEach((element) => {
            this.permissionGroups.forEach((group) => {
                if (group.ID == element.GroupID) {
                    group.selected = true;
                }
            });
        });

        this.updateSelectedCount();
    }

}

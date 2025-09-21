import { Component, inject } from '@angular/core';
import { UsersFormComponent } from '../users-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BftTableComponent } from "../../../../shared/components/tables/bft-table/bft-table.component";
import { BftButtonComponent } from "../../../../shared/components/buttons/bft-button/bft-button.component";
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [BftTableComponent, BftButtonComponent,WrapperAddComponent],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent extends BaseRoutedComponent {
private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.user.Title;

    isVisible: boolean = false;
    data = [];
    columns = [
        {
            header: 'Full Name',
            name: 'FullName',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
       
        {
            header: 'Phone',
            name: 'PhoneNo',
            isSort: true,
            isFilterList: true,
            type: 'pNumber',
        },
        {
            header: 'Address',
            name: 'Address',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Modified By',
            name: 'ModifiedBy',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Modified Date',
            name: 'ModifiedDate',
            isSort: true,
            isFilterList: true,
            type: 'date',
        },
    ];

    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getUsers().subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching Users :', err);
            },
        });
    }

    addUser() {
        this.modalService
            .openModal({
                component: UsersFormComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }

    onView(row) {
     this.modalService
        .openModal({
            component: UsersFormComponent,
            title: this.title,
            ID: row.ID,
        })
        .afterClose.subscribe((res: boolean) => {
            if (res) {
                this.getData();
            }
        });
    }
}


import { Component, inject } from '@angular/core';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { EmployeeManagementFormComponent } from '../employee-management-form.component';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
    selector: 'app-employee-management-list',
    standalone: true,
    imports: [BftTableComponent, WrapperAddComponent, BftButtonComponent],
    templateUrl: './employee-management-list.component.html',
    styleUrl: './employee-management-list.component.scss',
})
export class EmployeeManagementListComponent extends BaseRoutedComponent {
    private modalService = inject(ModalService);
    private nzModal = inject(NzModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.employee.Title;
    isVisible: boolean = false;
    data = [];
    columns = [
        {
            header: 'Join Date',
            name: 'JoinDate',
            isSort: true,
            isFilterList: true,
            type: 'date',
        },
       
        {
            header: 'Employee Name',
            name: 'Description',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Salary',
            name: 'Salary',
            isSort: true,
            isFilterList: true,
            type: 'currency',
        },
        {
            header: 'Email',
            name: 'Email',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Phone No',
            name: 'PhoneNo',
            isSort: true,
            isFilterList: true,
            type: 'pNumber',
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
         {
            header: 'Active',
            name: 'IsActive',
            isSort: true,
            isFilterList: true,
            type: 'status',
        },
    ];

    ngOnInit() {
        this.getData();
    }

    addEmployee() {
        this.modalService.openModal({
            component: EmployeeManagementFormComponent,
            title: this.title,
            ID: null,
        }).afterClose.subscribe((res: boolean) => {
        if (res) {
          this.getData();
        }
      });
    }

    getData() {
        this._listService.getEmployee().subscribe({
            next: (res: any) => {
                this.data = res;
            },
            error: (err) => {
                console.error('Error fetching expense:', err);
            },
        });
    }

    onView(row) {
        this.modalService
            .openModal({
                component: EmployeeManagementFormComponent,
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

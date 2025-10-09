import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { CommonModule } from '@angular/common';
import { PayrollManagementComponent } from '../payroll-management.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PayrollManagementCashComponent } from '../payroll-management-cash/payroll-management-cash.component';

@Component({
    selector: 'app-payroll-list',
    standalone: true,
    imports: [BftTableComponent, WrapperAddComponent, BftButtonComponent, BftInputDateComponent, FormsModule, CommonModule, ScrollingModule],
    templateUrl: './payroll-list.component.html',
    styleUrl: './payroll-list.component.scss',
})
export class PayrollListComponent extends BaseRoutedComponent {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.payroll.Title;
    isVisible: boolean = false;
    
    // Month/Year filter
    selectedMonth: Date | null = null;
    
    columns = [
        
        {
            header: 'Process Date',
            name: 'Date',
            isSort: true,
            isFilterList: true,
            type: 'date',
        },
        {
            header: 'Employee Name',
            name: 'EmployeeName',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Salary Type',
            name: 'SalaryType',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Process Salary',
            name: 'ProcessSalary',
            isSort: true,
            isFilterList: true,
            type: 'currency',
            total:true
        },
        {
            header: 'Salary',
            name: 'Salary',
            isSort: true,
            isFilterList: true,
            type: 'currency',
        },
        {
            header: 'Payroll Month',
            name: 'PayrollMonth',
            isSort: true,
            isFilterList: true,
            type: 'date',
        },
        {
            header: 'Payroll Cycle',
            name: 'PayrollCycle',
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
    data = [];

    ngOnInit() {
        this.getData();
    }

    getData() {
        // Get current month as default
        if (!this.selectedMonth) {
            this.selectedMonth = new Date();
        }
        
        this._listService.getEmployeePayRoll(this.selectedMonth).subscribe({
            next: (res: any) => {
                this.data = res || [];
            },
            error: (error) => {
                console.error('Error fetching payroll data:', error);
                this.data = [];
            }
        });
    }

    onMonthChange() {
        this.getData();
    }

    openForm() {
        this.modalService
            .openModal({
                component: PayrollManagementComponent,
                title: this.title,
                ID: null,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }
    openFormCash() {
        this.modalService
            .openModal({
                component: PayrollManagementCashComponent,
                title: this.title,
                ID: null,
            },1600)
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }

    // onView(row: any) {
    //     this.modalService
    //         .openModal({
    //             component: PayrollManagementComponent,
    //             title: this.title,
    //             ID: row.ID,
    //         })
    //         .afterClose.subscribe((res: boolean) => {
    //             if (res) {
    //                 this.getData();
    //             }
    //         });
    // }
}

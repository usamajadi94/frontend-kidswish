import { Component, inject } from '@angular/core';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { EmployeeAttendanceComponent } from '../employee-attendance.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-employee-attendance-list',
    standalone: true,
    imports: [BftTableComponent, WrapperAddComponent, BftButtonComponent, BftInputDateComponent, FormsModule, CommonModule, ScrollingModule],
    templateUrl: './employee-attendance-list.component.html',
    styleUrl: './employee-attendance-list.component.scss',
})
export class EmployeeAttendanceListComponent extends BaseRoutedComponent {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.employeeAttendance.Title;
    isVisible: boolean = false;
    
    // Month/Year filter
    selectedMonth: Date | null = null;
    
    columns = [
        
        {
            header: 'Date',
            name: 'Date',
            isSort: true,
            isFilterList: true,
            type: 'date',
        },
        {
            header:'Attendance',
            name:'IsAvailable',
            type:'status'
        }
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
        
        this._listService.getEmployeeAttendance(this.selectedMonth).subscribe({
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
                component: EmployeeAttendanceComponent,
                title: this.title,
                ID: null,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) {
                    this.getData();
                }
            });
    }

    onView(row) {
        if(row.ID > 0){
            this.modalService
                .openModal({
                    component: EmployeeAttendanceComponent,
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
}

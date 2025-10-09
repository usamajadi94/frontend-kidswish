import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { EmployeeAttendanceDetail, EmployeeAttendanceMaster } from 'app/modules/setup/models/employee-attendance';

@Component({
    selector: 'app-employee-attendance',
    standalone: true,
    imports: [CommonModule, FormsModule, BftInputDateComponent, BftCheckboxComponent, BftInputNumberComponent, BftButtonComponent, MatIconModule, NzPaginationModule],
    templateUrl: './employee-attendance.component.html',
    styleUrl: './employee-attendance.component.scss',
})
export class EmployeeAttendanceComponent extends BaseComponent<
    EmployeeAttendanceMaster,
    EmployeeAttendanceComponent
> {
    heading: string = componentRegister.employeeAttendance.Title;
    private _listService = inject(ListService);
    employees: Array<any> = [];
    employeeIdToName: Record<number, string> = {};
    pageIndex: number = 1;
    pageSize: number = 10;
    pagedRows: EmployeeAttendanceDetail[] = [];

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.employeeAttendanceController);
        this.setFormTitle(componentRegister.employeeAttendance.Title);
    }

    public override InitializeObject(): void {
        this.formData = new EmployeeAttendanceMaster();
    }

    public override async BeforeInit(): Promise<void> {
        await this.loadEmployees();
    }
    
    public override async AfterInit(): Promise<void> {
        this.ensureDetailRows();
        this.updatePagedRows();
    }

    public override AfterGetData(): void {
        // When editing existing record, ensure any new employees get a detail row as well
        this.ensureDetailRows();
        this.updatePagedRows();
    }

    private loadEmployees(): Promise<void> {
        return new Promise((resolve) => {
            this._listService.getEmployee('Yes').subscribe({
                next: (res: any[]) => {
                    this.employees = res || [];
                    this.employeeIdToName = {};
                    this.employees.forEach((e) => {
                        if (e?.ID != null) this.employeeIdToName[e.ID] = e?.Description || '';
                    });
                    resolve();
                },
                error: () => resolve(),
            });
        });
    }

    private ensureDetailRows(): void {
        const details = this.formData.Emp_Attendance_Detail || [];
        const existing = new Set<number>((details || []).map((d) => d.EmployeeID).filter((x) => x != null));
        const toAdd: EmployeeAttendanceDetail[] = [];
        this.employees.forEach((emp) => {
            if (emp?.ID != null && !existing.has(emp.ID)) {
                const d = new EmployeeAttendanceDetail();
                d.EmployeeID = emp.ID;
                if(this.formData.ID == 0){
                    d.IsPresent = true;
                }
                toAdd.push(d);
            }
        });
        this.formData.Emp_Attendance_Detail = [...details, ...toAdd];
    }

    updatePagedRows(): void {
        const all = this.getSortedDetails();
        const start = (this.pageIndex - 1) * this.pageSize;
        this.pagedRows = all.slice(start, start + this.pageSize);
    }

    get totalPresent(): number {
        const all = this.formData?.Emp_Attendance_Detail || [];
        return all.filter((r) => !!r.IsPresent).length;
    }

    get totalAbsent(): number {
        const all = this.formData?.Emp_Attendance_Detail || [];
        return all.filter((r) => !r.IsPresent && !r.OnVacation).length;
    }

    private getSortedDetails(): EmployeeAttendanceDetail[] {
        const all = [...(this.formData?.Emp_Attendance_Detail || [])];
        const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
        all.sort((a, b) => {
            const nameA = this.employeeIdToName[a?.EmployeeID ?? -1] || '';
            const nameB = this.employeeIdToName[b?.EmployeeID ?? -1] || '';
            return collator.compare(nameA, nameB);
        });
        return all;
    }
}

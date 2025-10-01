import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { PayrollMaster } from 'app/modules/setup/models/payroll-master.dto';
import { PayrollDetail } from 'app/modules/setup/models/payroll-detail.dto';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
    selector: 'app-payroll-management',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        BftInputDateComponent,
        BftSelectComponent,
        BftButtonComponent,
        BftCheckboxComponent,
        BftInputCurrencyComponent,
        NzInputModule,
        NzPaginationModule,
        MatIconModule,
    ],
    templateUrl: './payroll-management.component.html',
    styleUrl: './payroll-management.component.scss',
})
export class PayrollManagementComponent extends BaseComponent<
    PayrollMaster,
    PayrollManagementComponent
> {
    // For BftForm shell compatibility
    heading: string = componentRegister.payroll.Title;
    cycles: Array<string> = ['First Half (1st-15th)', 'Full Month'];
    employees: Array<any> = [];
    selectAll: boolean = false;
    selectedMap: Record<number, boolean> = {};
    searchText: string = '';
    pageSize: number = 10;
    pageIndex: number = 1;

    private _modalRef = inject(NzModalRef);
    private _listService = inject(ListService);
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.payrollController);
        this.setFormTitle(componentRegister.payroll.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public async BeforeInit(): Promise<void> {
        await this.getEmployee();
    }

    getEmployee() {
        this._listService.getEmployee().subscribe({
            next: (res: any[]) => {
                this.employees = (res || []).map((emp) => ({
                    ...emp,
                    ProcessSalary: this.getProcessedSalary(emp.Salary),
                }));
            },
        });
    }

    public override InitializeObject(): void {
        this.formData = new PayrollMaster();
        this.formData.PayrollCycle = 'Full Month';
    }

    onSearchChange() {
        this.pageIndex = 1;
    }

    get selectedCount(): number {
        return Object.values(this.selectedMap).filter(Boolean).length;
    }

    get filteredEmployees(): Array<any> {
        const s = (this.searchText || '').toLowerCase().trim();
        const list = s
            ? this.employees.filter(
                  (e) =>
                      (e?.Description || '').toLowerCase().includes(s) ||
                      (e?.EmployeeId || '').toLowerCase().includes(s)
              )
            : this.employees;
        return list;
    }

    get pagedEmployees(): Array<any> {
        const start = (this.pageIndex - 1) * this.pageSize;
        return this.filteredEmployees.slice(start, start + this.pageSize);
    }

    onPaymentCycleChange() {
        // Recalculate Process Salary for all employees when cycle changes
        this.employees.forEach((emp) => {
            emp.ProcessSalary = this.getProcessedSalary(emp.Salary);
        });
    }

    getProcessedSalary(salary: number): number {
        if (salary == null) return 0;
        if (this.formData.PayrollCycle === 'First Half (1st-15th)') {
            return Number(salary) / 2;
        }
        // Full Month
        return Number(salary);
    }

    toggleAll(checked: boolean) {
        this.employees.forEach((e) => {
            if (e?.ID != null) this.selectedMap[e.ID] = checked;
        });
        this.selectAll = checked;
    }

    public override BeforeInsert(formData: PayrollMaster): void {
        // Create payroll details array with only checked employees
        const selectedEmployees = this.employees.filter(emp => this.selectedMap[emp.ID]);
        
        formData.Payroll_Detail = selectedEmployees.map(emp => {
            const detail = new PayrollDetail();
            detail.EmployeeID = emp.ID;
            detail.ProcessSalary = emp.ProcessSalary || this.getProcessedSalary(emp.Salary);
            return detail;
        });

        console.log('formData' ,this.formData);
    }

    cancel() {
        this._modalRef.close(false);
    }
}

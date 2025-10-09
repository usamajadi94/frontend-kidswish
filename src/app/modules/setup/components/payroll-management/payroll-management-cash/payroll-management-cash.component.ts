import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { PayrollMaster } from 'app/modules/setup/models/payroll-master.dto';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { ActivatedRoute } from '@angular/router';
import { PayrollDetail } from 'app/modules/setup/models/payroll-detail.dto';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { ListService } from 'app/modules/shared/services/list.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { SalaryType } from 'app/modules/shared/enums/salaryType';
import { DrpService } from 'app/modules/shared/services/drp.service';

@Component({
    selector: 'app-payroll-management-cash',
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
    templateUrl: './payroll-management-cash.component.html',
    styleUrls: ['./payroll-management-cash.component.scss'],
})
export class PayrollManagementCashComponent extends BaseComponent<
    PayrollMaster,
    PayrollManagementCashComponent
> {
    heading: string = componentRegister.payroll.Title;
    cycles: Array<string> = ['First Half (1st-15th)','Second Half (16th-31th)', 'Full Month'];
    employees: Array<any> = [];
    salaryTypes: Array<any> = [];
    selectAll: boolean = false;
    selectedMap: Record<number, boolean> = {};
    searchText: string = '';
    pageSize: number = 10;
    pageIndex: number = 1;
    salaryTypeEnum = SalaryType;
    private _DrpService = inject(DrpService);
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
        await this.getSalaryTypes();
    }
    public async AfterInit(): Promise<void> {
        await this.getEmployee();
    }

    getEmployee() {
        this._listService.getEmployeeAbsentSummary(this.formData.SalaryTypeID,this.formData.FromDate,this.formData.ToDate).subscribe({
            next: (res: any[]) => {
                this.employees = (res || []).map((emp) => {
                    const salary = Number(emp?.Salary) || 0;
                    const fortnightly = this.getFortnightlyRate(salary);
                    const daily = this.getDailyRate(salary);
                    const hourly = this.getHourlyRateFromDaily(daily);
                    const workedDay = this.getWorkedDays();
                    const subtractHr = Number((emp as any)?.AbsentHours ?? (emp as any)?.AbsentHours ?? (emp as any)?.AbsentHours ?? 0) || 0;
                    const deductAmount = subtractHr * hourly;
                    const processSalary = fortnightly - deductAmount;
                    const pension = this.calculatePension(processSalary);
                    const insurance = this.calculateInsurance(processSalary);
                    const planComp = Number((emp as any)?.PlanComp ?? 0) || 0;
                    const tax = Number((emp as any)?.Tax ?? 0) || 0;
                    const netSalary = this.computeNetSalary(processSalary, pension, insurance, planComp, tax);
                    return {
                        ...emp,
                        Salary: salary,
                        Fortnightly: fortnightly,
                        Daily: daily,
                        HourlySalary: hourly,
                        WorkedDay: workedDay,
                        SubtractHR: subtractHr,
                        DeductAmount: deductAmount,
                        ProcessSalary: processSalary,
                        Pension: pension,
                        Insurance: insurance,
                        PlanComp: planComp,
                        Tax: tax,
                        NetSalary: netSalary,
                    };
                });
                if(this.primaryKey == 0){
                    this.selectedMap = {};
                    this.toggleAll(true);
                }
            },
        });
    }

    getSalaryTypes() {
        this._DrpService.getSalaryTypes().subscribe({
            next: (res: any) => {
                this.salaryTypes = res;
            },
        });
    }

    public override InitializeObject(): void {
        this.formData = new PayrollMaster();
        this.formData.PayrollCycle = 'Full Month';
        this.formData.SalaryTypeID = SalaryType.Cash;
        this.updateDateRange();
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
                      (e?.EmployeeName || '').toLowerCase().includes(s) ||
                      String(e?.EmployeeID || '').toLowerCase().includes(s)
              )
            : this.employees;
        return list;
    }

    get pagedEmployees(): Array<any> {
        const start = (this.pageIndex - 1) * this.pageSize;
        return this.filteredEmployees.slice(start, start + this.pageSize);
    }

    onTypeChange(){
        this.getEmployee();
    }

    onPaymentCycleChange() {
        // Recalculate derived fields for all employees when cycle changes
        this.employees.forEach((emp) => this.recomputeEmployeeDerived(emp));
        this.updateDateRange();
        this.getEmployee();
    }

    getProcessedSalary(salary: number): number {
        if (salary == null) return 0;
        if (this.formData.PayrollCycle === 'First Half (1st-15th)' || this.formData.PayrollCycle === 'Second Half (16th-31th)') {
            return Number(salary) / 2;
        }
        // Full Month
        return Number(salary);
    }

    private getFortnightlyRate(salary: number): number {
        if (salary == null) return 0;
        if (this.formData.PayrollCycle === 'First Half (1st-15th)' || this.formData.PayrollCycle === 'Second Half (16th-31th)') {
            return Number(salary) / 2;
        }
        return Number(salary);
    }

    private getDailyRate(total: number): number {
        if (total == null) return 0;
        // Daily formula: total / 23.83
        return Number(total) / 23.83;
    }

    private getHourlyRateFromDaily(daily: number): number {
        if (daily == null) return 0;
        // Hourly salary formula: daily / 8
        return Number(daily) / 8;
    }

    private getWorkedDays(): number {
        // Worked day: 11.915 for half cycles, otherwise 23.83
        if (this.formData.PayrollCycle === 'First Half (1st-15th)' || this.formData.PayrollCycle === 'Second Half (16th-31th)') {
            return 11.915;
        }
        return 23.83;
    }

    onWorkedOrHoursChange(emp: any) {
        this.recomputeEmployeeDerived(emp);
    }

    onAllowanceOrTaxChange(emp: any) {
        this.recomputeNetSalary(emp);
    }

    private recomputeEmployeeDerived(emp: any) {
        const salary = Number(emp?.Salary) || 0;
        const fortnightly = this.getFortnightlyRate(salary);
        const daily = this.getDailyRate(salary);
        const hourly = this.getHourlyRateFromDaily(daily);
        emp.Fortnightly = fortnightly;
        emp.Daily = daily;
        emp.HourlySalary = hourly;
        emp.WorkedDay = this.getWorkedDays();
        const subtractHr = Number(emp?.SubtractHR) || 0;
        emp.DeductAmount = subtractHr * hourly;
        emp.ProcessSalary = fortnightly - emp.DeductAmount;
        // Recalculate Pension and Insurance based on new ProcessSalary
        emp.Pension = this.calculatePension(emp.ProcessSalary);
        emp.Insurance = this.calculateInsurance(emp.ProcessSalary);
        this.recomputeNetSalary(emp);
    }

    private recomputeNetSalary(emp: any) {
        const pension = Number(emp?.Pension) || 0;
        const insurance = Number(emp?.Insurance) || 0;
        const planComp = Number(emp?.PlanComp) || 0;
        const tax = Number(emp?.Tax) || 0;
        const processSalary = Number(emp?.ProcessSalary) || 0;
        emp.NetSalary = this.computeNetSalary(processSalary, pension, insurance, planComp, tax);
    }

    private computeNetSalary(processSalary: number, pension: number, insurance: number, planComp: number, tax: number): number {
        // Net = ProcessSalary - Pension - Insurance - PlanComp - Tax
        return (Number(processSalary) || 0) - (Number(pension) || 0) - (Number(insurance) || 0) - (Number(planComp) || 0) - (Number(tax) || 0);
    }

    private calculatePension(processSalary: number): number {
        // Pension = ProcessSalary * 2.87%
        return (Number(processSalary) || 0) * 0.0287;
    }

    private calculateInsurance(processSalary: number): number {
        // Insurance = ProcessSalary * 3.04%
        return (Number(processSalary) || 0) * 0.0304;
    }

    toggleAll(checked: boolean) {
        this.employees.forEach((e) => {
            if (e?.EmployeeID != null) this.selectedMap[e.EmployeeID] = checked;
        });
        this.selectAll = checked;
    }

    onPayrollMonthChange() {
        this.updateDateRange();
        this.getEmployee();
    }

    private updateDateRange(): void {
        const monthDate = this.formData?.PayrollMonth ? new Date(this.formData.PayrollMonth) : new Date();
        const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        if (this.formData.PayrollCycle === 'First Half (1st-15th)') {
            this.formData.FromDate = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 1);
            this.formData.ToDate = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 15);
        } else if (this.formData.PayrollCycle === 'Second Half (16th-31th)') {
            this.formData.FromDate = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 16);
            this.formData.ToDate = new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate());
        } else {
            // Full Month
            this.formData.FromDate = startOfMonth;
            this.formData.ToDate = endOfMonth;
        }
    }

    public override BeforeInsert(formData: PayrollMaster): void {
        // Create payroll details array with only checked employees
        const selectedEmployees = this.employees.filter(emp => this.selectedMap[emp.EmployeeID]);
        
        formData.Payroll_Detail = selectedEmployees.map(emp => {
            const detail = new PayrollDetail();
            detail.EmployeeID = emp.EmployeeID;
            detail.Salary = Number(emp.Salary) || 0;
            detail.Fortnightly = Number(emp.Fortnightly) || 0;
            detail.Daily = Number(emp.Daily) || 0;
            detail.HourlySalary = Number(emp.HourlySalary) || 0;
            detail.WorkedDay = Number(emp.WorkedDay) || 0;
            detail.SubtractHR = Number(emp.SubtractHR) || 0;
            detail.DeductAmount = Number(emp.DeductAmount) || 0;
            detail.ProcessSalary = Number(emp.ProcessSalary) || this.getFortnightlyRate(detail.Salary) - (detail.SubtractHR * detail.HourlySalary);
            detail.Pension = Number(emp.Pension) || 0;
            detail.Insurance = Number(emp.Insurance) || 0;
            detail.PlanComp = Number(emp.PlanComp) || 0;
            detail.Tax = Number(emp.Tax) || 0;
            detail.NetSalary = Number(emp.NetSalary) || this.computeNetSalary(detail.ProcessSalary, detail.Pension, detail.Insurance, detail.PlanComp, detail.Tax);
            return detail;
        });

        console.log('formData' ,this.formData);
    }

    cancel() {
        this._modalRef.close(false);
    }
}



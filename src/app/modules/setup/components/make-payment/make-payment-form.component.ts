import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { PaymentTransaction } from '../../models/payment-transaction';
import { DecimalPipe } from '@angular/common';

interface BulkLine {
    PaymentType: string | null;
    FromPartyID: number | null;
    Amount: number | null;
    ToPartyID: number | null;
    PettyCashID: number | null;
    ExpenseCategoryID: number | null;
    Notes: string;
}

@Component({
    selector: 'app-make-payment-form',
    standalone: true,
    imports: [FormsModule, BftInputDateComponent, BftSelectComponent, BftInputCurrencyComponent, BftTextareaComponent, DecimalPipe],
    templateUrl: './make-payment-form.component.html',
    styleUrl: './make-payment-form.component.scss',
})
export class MakePaymentFormComponent extends BaseComponent<PaymentTransaction, MakePaymentFormComponent> {
    private _drpService = inject(DrpService);
    private _http = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);

    paymentTypes = [
        { ID: 'Cash', Name: 'Cash' },
        { ID: 'Bank Transfer', Name: 'Bank Transfer' },
        { ID: 'Cheque', Name: 'Cheque' },
        { ID: 'Online Transfer', Name: 'Online Transfer' },
    ];

    bankAccounts: any[] = [];
    vendors: any[] = [];
    pettyCashList: any[] = [];
    expenseCategories: any[] = [];

    isDailyExpense = false;
    dailyExpensePettyCashID: number | null = null;
    dailyExpenseCategoryID: number | null = null;

    bulkLines: BulkLine[] = [];

    get bulkTotal(): number {
        return this.bulkLines.reduce((s, l) => s + (parseFloat(l.Amount as any) || 0), 0);
    }

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.paymentTransactionController);
        this.setFormTitle(componentRegister.makePayment.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this._drpService.getBankAccountDrp().subscribe({ next: (res: any) => { this.bankAccounts = res; } });
        this._drpService.getVendorDrp().subscribe({ next: (res: any) => { this.vendors = res; } });
        this._drpService.getPettyCashDrp().subscribe({ next: (res: any) => { this.pettyCashList = res; } });
        this._drpService.getExpenseCategoryDrp().subscribe({ next: (res: any) => { this.expenseCategories = res; } });
    }

    public override InitializeObject(): void {
        this.formData = new PaymentTransaction();
        this.formData.Date = new Date() as any;
        this.formData.TransactionType = 'payment';
        this.formData.FromPartyType = 'bank_account';
        this.formData.ToPartyType = 'vendor';
        this.formData.SCode = 'pay_02';
        this.isDailyExpense = false;
        this.bulkLines = [
            { PaymentType: null, FromPartyID: null, Amount: null, ToPartyID: null, PettyCashID: null, ExpenseCategoryID: null, Notes: '' },
        ];
    }

    addLine() {
        this.bulkLines.push({ PaymentType: null, FromPartyID: null, Amount: null, ToPartyID: null, PettyCashID: null, ExpenseCategoryID: null, Notes: '' });
    }

    removeLine(i: number) {
        this.bulkLines.splice(i, 1);
    }

    override async InsertRecord(): Promise<void> {
        if (this.primaryKey > 0) {
            return super.InsertRecord();
        }

        // Bulk add path
        const validLines = this.bulkLines.filter(l => (parseFloat(l.Amount as any) || 0) > 0);
        this.validation = [];
        if (!this.formData.Date) this.validation.push('Date is required.');
        if (validLines.length === 0) this.validation.push('At least one line with an amount is required.');
        if (this.isDailyExpense) {
            validLines.forEach((l, i) => {
                if (!l.FromPartyID) this.validation.push(`Row ${i + 1}: Bank Account is required.`);
                if (!l.PettyCashID) this.validation.push(`Row ${i + 1}: Petty Cash Account is required.`);
                if (!l.ExpenseCategoryID) this.validation.push(`Row ${i + 1}: Expense Category is required.`);
            });
        } else {
            validLines.forEach((l, i) => {
                if (!l.PaymentType) this.validation.push(`Row ${i + 1}: Payment Type is required.`);
                if (!l.FromPartyID) this.validation.push(`Row ${i + 1}: Bank Account is required.`);
            });
        }
        if (this.validation.length > 0) {
            this.modalSer.validationModal(this.validation);
            return;
        }

        this.isSubmitLoading = true;
        const headers = new HttpHeaders({
            uid: this._localStorage.uid,
            cid: this._localStorage.cid,
            eid: this._localStorage.eid,
        });

        try {
            for (const line of validLines) {
                if (this.isDailyExpense) {
                    // Topup: bank → petty cash
                    await firstValueFrom(
                        this._http.post(`${apiUrls.server}${apiUrls.paymentTransactionController}`, {
                            Date: this.formData.Date,
                            Amount: parseFloat(line.Amount as any),
                            PaymentType: line.PaymentType || 'Bank Transfer',
                            FromPartyType: 'bank_account',
                            FromPartyID: line.FromPartyID,
                            ToPartyType: 'petty_cash',
                            ToPartyID: line.PettyCashID,
                            TransactionType: 'topup',
                            Notes: line.Notes || null,
                            SCode: 'pay_03',
                        }, { headers })
                    );
                    // Expense: from petty cash
                    await firstValueFrom(
                        this._http.post(`${apiUrls.server}${apiUrls.expenseController}`, {
                            Date: this.formData.Date,
                            Amount: parseFloat(line.Amount as any),
                            PettyCashID: line.PettyCashID,
                            ExpenseCategoryID: line.ExpenseCategoryID,
                            VendorID: line.ToPartyID || null,
                            Notes: line.Notes || null,
                            SCode: componentRegister.expense?.SCode || 'set_05',
                        }, { headers })
                    );
                } else {
                    await firstValueFrom(
                        this._http.post(`${apiUrls.server}${apiUrls.paymentTransactionController}`, {
                            Date: this.formData.Date,
                            Amount: parseFloat(line.Amount as any),
                            PaymentType: line.PaymentType,
                            FromPartyType: 'bank_account',
                            FromPartyID: line.FromPartyID,
                            ToPartyType: line.ToPartyID ? 'vendor' : null,
                            ToPartyID: line.ToPartyID || null,
                            TransactionType: 'payment',
                            Notes: line.Notes || null,
                            SCode: 'pay_02',
                        }, { headers })
                    );
                }
            }
            this.msgSer.success(`${validLines.length} payment(s) saved successfully!`);
            this.isCreated = true;
            this.isSubmitLoading = false;
        } catch (e: any) {
            this.isSubmitLoading = false;
            this.toasterSer.openResult(e.status || 500);
        }
    }

    override BeforeUpSert(): void {
        if (this.isDailyExpense) {
            this.formData.TransactionType = 'topup';
            this.formData.FromPartyType = 'bank_account';
            this.formData.ToPartyType = 'petty_cash';
            this._vendorIdForExpense = this.formData.ToPartyID;
            this.formData.ToPartyID = this.dailyExpensePettyCashID;
            this.formData.SCode = 'pay_03';
        } else {
            this.formData.TransactionType = 'payment';
            this.formData.FromPartyType = 'bank_account';
            this.formData.ToPartyType = 'vendor';
            this.formData.SCode = 'pay_02';
        }
    }

    private _vendorIdForExpense: number | null = null;

    override AfterUpsert(data: PaymentTransaction): void {
        if (!this.isDailyExpense) return;

        const headers = new HttpHeaders({
            uid: this._localStorage.uid,
            cid: this._localStorage.cid,
            eid: this._localStorage.eid,
        });

        const expense = {
            Date: this.formData.Date,
            Amount: this.formData.Amount,
            PettyCashID: this.dailyExpensePettyCashID,
            ExpenseCategoryID: this.dailyExpenseCategoryID,
            VendorID: this._vendorIdForExpense || null,
            Notes: this.formData.Notes || null,
            SCode: componentRegister.expense?.SCode || 'set_05',
        };

        this._http.post(`${apiUrls.server}${apiUrls.expenseController}`, expense, { headers }).subscribe({
            error: (e) => console.error('Failed to create expense entry:', e),
        });
    }

    override ValidateBeforeSave(formData: PaymentTransaction): boolean {
        this.validation = [];
        if (!formData.Date) this.validation.push('Date is required.');
        if (!formData.Amount || formData.Amount <= 0) this.validation.push('Amount must be greater than 0.');
        if (!formData.PaymentType) this.validation.push('Payment Type is required.');
        if (!formData.FromPartyID) this.validation.push('Bank Account is required.');
        if (this.isDailyExpense) {
            if (!this.dailyExpensePettyCashID) this.validation.push('Daily Expense Account is required.');
            if (!this.dailyExpenseCategoryID) this.validation.push('Expense Category is required.');
        } else {
            if (!formData.ToPartyID) this.validation.push('Vendor is required.');
        }
        return this.validation.length > 0;
    }
}

import { Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
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
import { CashInHand } from '../../models/cash-in-hand';

interface BulkCashLine {
    Date: string;
    Type: string;
    PaymentCategoryID: number | null;
    Amount: number | null;
    ToPartyID: number | null;
    Notes: string;
}

@Component({
    selector: 'app-cash-in-hand-form',
    standalone: true,
    imports: [CommonModule, FormsModule, DecimalPipe, BftInputDateComponent, BftSelectComponent, BftInputCurrencyComponent, BftTextareaComponent],
    templateUrl: './cash-in-hand-form.component.html',
})
export class CashInHandFormComponent extends BaseComponent<CashInHand, CashInHandFormComponent> {
    private _drp = inject(DrpService);
    private _http = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);

    paymentCategories: any[] = [];
    expenseCategories: any[] = [];
    vendors: any[] = [];
    transactionTypes = [
        { ID: 'in',  Name: 'Cash In' },
        { ID: 'out', Name: 'Cash Out' },
    ];

    isCategoryLocked = false;
    selectedFile: File | null = null;
    isUploading = false;
    uploadError = '';
    private _categoriesLoaded = false;
    private _afterDisplayRan = false;

    bulkLines: BulkCashLine[] = [];
    get bulkTotal(): number { return this.bulkLines.reduce((s, l) => s + (parseFloat(l.Amount as any) || 0), 0); }

    private emptyLine(): BulkCashLine {
        return { Date: new Date().toISOString().split('T')[0], Type: 'out', PaymentCategoryID: null, Amount: null, ToPartyID: null, Notes: '' };
    }
    addLine() { this.bulkLines.push(this.emptyLine()); }
    removeLine(i: number) { this.bulkLines.splice(i, 1); }

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.cashInHandController);
        this.setFormTitle(componentRegister.cashInHand.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this._drp.getPaymentCategoryDrp().subscribe({ next: (res: any) => { this.paymentCategories = res; this._categoriesLoaded = true; this.applyCategoryType(); } });
        this._drp.getExpenseCategoryDrp().subscribe({ next: (res: any) => { this.expenseCategories = res; } });
        this._drp.getVendorDrp().subscribe({ next: (res: any) => { this.vendors = res; } });
    }

    private applyCategoryType(): void {
        if (this._categoriesLoaded && this._afterDisplayRan && this.formData?.PaymentCategoryID) {
            this.formData.Type = 'out';
        }
    }

    public override InitializeObject(): void {
        this.formData = new CashInHand();
        this.formData.Date = new Date() as any;
        this.formData.Type = 'in';
        this.bulkLines = [this.emptyLine()];
    }

    override async InsertRecord(): Promise<void> {
        if (this.primaryKey > 0) return super.InsertRecord();

        const validLines = this.bulkLines.filter(l => (parseFloat(l.Amount as any) || 0) > 0);
        this.validation = [];
        if (validLines.length === 0) this.validation.push('At least one line with an amount is required.');
        validLines.forEach((l, i) => {
            if (!l.Date) this.validation.push(`Row ${i + 1}: Date is required.`);
            if (!l.PaymentCategoryID) this.validation.push(`Row ${i + 1}: Category is required.`);
        });
        if (this.validation.length > 0) { this.modalSer.validationModal(this.validation); return; }

        this.isSubmitLoading = true;
        const headers = new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
        try {
            for (const line of validLines) {
                await firstValueFrom(this._http.post(`${apiUrls.server}${apiUrls.cashInHandController}`, {
                    Date: line.Date,
                    Type: line.Type,
                    PaymentCategoryID: line.PaymentCategoryID,
                    Amount: parseFloat(line.Amount as any),
                    ToPartyID: line.ToPartyID || null,
                    Notes: line.Notes || null,
                    SCode: componentRegister.cashInHand.SCode,
                }, { headers }));
            }
            this.msgSer.success(`${validLines.length} entr${validLines.length === 1 ? 'y' : 'ies'} saved!`);
            this.isCreated = true;
            this.isSubmitLoading = false;
            this.modalSer.closeModal(true);
        } catch (e: any) {
            this.isSubmitLoading = false;
            this.toasterSer.openResult(e.status || 500);
        }
    }

    public override async AfterDisplay(): Promise<void> {
        const preSelected = this.nzModalData?.Data?.PaymentCategoryID;
        if (preSelected) {
            this.formData.PaymentCategoryID = preSelected;
            this.isCategoryLocked = true;
            this._afterDisplayRan = true;
            this.applyCategoryType();
        }
    }

    get isDailyExpense(): boolean {
        if (!this.formData?.PaymentCategoryID) return false;
        const cat = this.paymentCategories.find(c => c.ID === this.formData.PaymentCategoryID);
        return cat?.Description === 'Daily Expense';
    }

    onCategoryChange(): void {
        if (this.formData.PaymentCategoryID) {
            this.formData.Type = 'out';
        }
        if (!this.isDailyExpense) {
            this.formData.ExpenseCategoryID = null;
        }
    }

    override ValidateBeforeSave(formData: CashInHand): boolean {
        this.validation = [];
if (!formData.PaymentCategoryID) this.validation.push('Category is required.');
        if (!formData.Date) this.validation.push('Date is required.');
        if (!formData.Amount || formData.Amount <= 0) this.validation.push('Amount must be greater than 0.');
        if (this.isDailyExpense && !formData.ExpenseCategoryID) this.validation.push('Sub Category is required for Daily Expense.');
        return this.validation.length > 0;
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;
        this.selectedFile = input.files[0];
        this.uploadError = '';
        this.uploadFile();
    }

    uploadFile(): void {
        if (!this.selectedFile) return;
        this.isUploading = true;
        const fd = new FormData();
        fd.append('file', this.selectedFile);
        this._http.post<any>(`${apiUrls.server}api/cash-in-hand/upload`, fd).subscribe({
            next: (res) => {
                if (res.Success) this.formData.AttachmentPath = res.Data.path;
                else this.uploadError = res.Message || 'Upload failed';
                this.isUploading = false;
            },
            error: () => { this.uploadError = 'Upload failed. Try again.'; this.isUploading = false; },
        });
    }

    removeAttachment(): void {
        this.formData.AttachmentPath = null;
        this.selectedFile = null;
        this.uploadError = '';
    }

    get attachmentUrl(): string {
        return this.formData?.AttachmentPath ? `${apiUrls.server}${this.formData.AttachmentPath}` : '';
    }

    get attachmentFileName(): string {
        return this.formData?.AttachmentPath?.split('/').pop() || '';
    }

    get isImage(): boolean {
        const ext = this.formData?.AttachmentPath?.split('.').pop()?.toLowerCase() || '';
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    }
}

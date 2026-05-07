import { Component, inject } from '@angular/core';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule } from '@angular/forms';
import { CashInHandFormComponent } from '../cash-in-hand-form.component';

@Component({
    selector: 'app-cash-in-hand-list',
    standalone: true,
    imports: [BftTableComponent, WrapperAddComponent, BftButtonComponent, NzDatePickerModule, NzDropDownModule, NzButtonModule, NzIconModule, FormsModule],
    templateUrl: './cash-in-hand-list.component.html',
})
export class CashInHandListComponent extends BaseRoutedComponent {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    private _drp = inject(DrpService);
    title: string = componentRegister.cashInHand.Title;
    isVisible: boolean = false;
    paymentCategories: any[] = [];
    columns = [
        { header: 'Date', name: 'Date', isSort: true, isFilterList: true, type: 'date' },
        { header: 'Category', name: 'Category', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Sub Category', name: 'SubCategory', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Vendor', name: 'Vendor', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Amount', name: 'Amount', isSort: true, isFilterList: true, type: 'currency', total: true },
        { header: 'Notes', name: 'Notes', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified By', name: 'ModifiedBy', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified Date', name: 'ModifiedDate', isSort: true, isFilterList: true, type: 'date' },
    ];
    data = [];
    date = null;

    ngOnInit() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.date = [firstDay, lastDay];
        this._drp.getPaymentCategoryDrp().subscribe({ next: (res: any) => { this.paymentCategories = res; } });
        this.getData();
    }

    getData() {
        if (!this.date) return;
        let fromDate = '';
        let toDate = '';
        if (this.date?.length === 2) {
            fromDate = this.formatDate(this.date[0]);
            toDate = this.formatDate(this.date[1]);
        }
        this._listService.getCashInHand(fromDate, toDate).subscribe({
            next: (res: any) => { this.data = res; },
        });
    }

    onView(row: any) {
        this.modalService.openModal({
            component: CashInHandFormComponent,
            title: this.title,
            ID: row.ID,
        }).afterClose.subscribe((res: boolean) => {
            if (res) this.getData();
        });
    }

    addNew(categoryID: number) {
        this.modalService.openModal({
            component: CashInHandFormComponent,
            title: this.title,
            ID: null,
            Data: { PaymentCategoryID: categoryID },
        }).afterClose.subscribe((res: boolean) => {
            if (res) this.getData();
        });
    }

    onChange(result: Date[]): void {
        this.date = result;
        this.getData();
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }
}

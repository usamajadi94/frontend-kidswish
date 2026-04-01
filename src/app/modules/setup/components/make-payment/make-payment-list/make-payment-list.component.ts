import { Component, inject, OnInit } from '@angular/core';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { MakePaymentFormComponent } from '../make-payment-form.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-make-payment-list',
    standalone: true,
    imports: [BftButtonComponent, BftTableComponent, WrapperAddComponent],
    templateUrl: './make-payment-list.component.html',
    styleUrl: './make-payment-list.component.scss',
})
export class MakePaymentListComponent extends BaseRoutedComponent implements OnInit {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title = componentRegister.makePayment.Title;
    isVisible = false;
    columns = [
        { header: 'Date', name: 'Date', isSort: true, isFilterList: true, type: 'date' },
        { header: 'Amount', name: 'Amount', isSort: true, isFilterList: true, type: 'currency' },
        { header: 'Payment Type', name: 'PaymentType', isSort: true, isFilterList: true, type: 'text' },
        { header: 'From', name: 'From', isSort: true, isFilterList: true, type: 'text' },
        { header: 'To', name: 'To', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified By', name: 'ModifiedBy', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified Date', name: 'ModifiedDate', isSort: true, isFilterList: true, type: 'date' },
    ];
    data = [];

    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getMakePayment().subscribe({
            next: (res: any) => { this.data = res; },
        });
    }

    onView(row) {
        this.modalService.openModal({ component: MakePaymentFormComponent, title: this.title, ID: row.ID })
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }

    add() {
        this.modalService.openModal({ component: MakePaymentFormComponent, title: this.title })
            .afterClose.subscribe((res: boolean) => { if (res) this.getData(); });
    }
}

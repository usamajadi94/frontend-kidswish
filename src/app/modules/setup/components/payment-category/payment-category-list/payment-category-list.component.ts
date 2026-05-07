import { Component, inject } from '@angular/core';
import { PaymentCategoryComponent } from '../payment-category.component';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';

@Component({
    selector: 'app-payment-category-list',
    standalone: true,
    imports: [BftTableComponent, WrapperAddComponent, BftButtonComponent],
    templateUrl: './payment-category-list.component.html',
})
export class PaymentCategoryListComponent extends BaseRoutedComponent {
    private modalService = inject(ModalService);
    private _listService = inject(ListService);
    title: string = componentRegister.paymentCategory.Title;
    isVisible: boolean = false;
    columns = [
        { header: 'Description', name: 'Description', isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified By',   name: 'ModifiedBy',   isSort: true, isFilterList: true, type: 'text' },
        { header: 'Modified Date', name: 'ModifiedDate', isSort: true, isFilterList: true, type: 'date' },
    ];
    data = [];

    ngOnInit() {
        this.getData();
    }

    getData() {
        this._listService.getPaymentCategory().subscribe({
            next: (res: any) => { this.data = res; },
        });
    }

    onView(row: any) {
        this.modalService.openModal({
            component: PaymentCategoryComponent,
            title: this.title,
            ID: row.ID,
        }).afterClose.subscribe((res: boolean) => {
            if (res) this.getData();
        });
    }

    addNew() {
        this.modalService.openModal({
            component: PaymentCategoryComponent,
            title: this.title,
            ID: null,
        }).afterClose.subscribe((res: boolean) => {
            if (res) this.getData();
        });
    }
}

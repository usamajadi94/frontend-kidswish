import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { FlavorOrderStatusEnum } from 'app/modules/shared/enums/flavor-order-status';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ProductOrderFormComponent } from '../product-order-form/product-order-form.component';

@Component({
    selector: 'app-packaging-stock-list',
    standalone: true,
    imports: [
        NzCardModule,
        NzTagModule,
        MatIconModule,
        CommonModule,
        NzGridModule,
        NzCollapseModule,
        MatTableModule,
        MatTabsModule,
        BftButtonComponent,
        NzTableModule,
        NzTagModule,
        NzDropDownModule,
        NzIconModule,
        NzButtonModule,
        MatIconModule,
        NzSelectModule,
        NzDropDownModule,
        NzInputModule,
        NzDrawerModule,
        FormsModule,
        BftInputDateComponent,
        BftSelectComponent,
    ],
    templateUrl: './packaging-stock-list.component.html',
    styleUrl: './packaging-stock-list.component.scss',
})
export class PackagingStockListComponent implements OnInit {
    FlavorOrderStatusEnum = FlavorOrderStatusEnum;
    title: string = componentRegister.packagingStock.Title;

    private listService = inject(ListService);
    private modalService = inject(ModalService);
    private messageModalService = inject(MessageModalService);
    private http = inject(HttpClient);

    groupedPacks: any[] = [];
    data: any[] = [];
    dataSource: any[] = [];

    StatusID: any[] = [];
    SupplierID: any[] = [];

    IsFilterDrawerVisible: boolean = false;
    fromDate: Date = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
    ); // 1st of current month
    endDate: Date = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
    ); // last day of current month

    async ngOnInit(): Promise<void> {
        await Promise.all([this.onGenerate(), this.getData()]);
    }

    addFlavorOrder() {
        this.modalService
            .openModal({
                component: ProductOrderFormComponent,
                title: componentRegister.flavorOrder.Title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) this.onGenerate();
            });
    }

    onView(row: any) {
        this.modalService
            .openModal({
                component: ProductOrderFormComponent,
                title: this.title,
                ID: row.ID,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res) this.onGenerate();
            });
    }

    UpdateStatus(ID: number, status: number, index: number) {
        this.http
            .post<any>(apiUrls.flavorOrderStatus, { ID, StatusID: status })
            .subscribe({
                next: (res) => {
                    if (res.Success) {
                        this.messageModalService.success(res.Message);
                        this.onGenerate();
                        this.getData();
                    }
                },
                error: (err) => {
                    this.messageModalService.error(err.Message);
                },
            });
    }

    getData() {
        this.listService.getProductWithFlavor().subscribe({
            next: (res) => {
                this.groupedPacks = this.groupByProduct(res);
            },
            error: (err) => {
                console.error('Error fetching products with Flavor:', err);
            },
        });
    }

    groupByProduct(data: any[]) {
        debugger;
        const grouped: { [key: number]: any } = {};

        data.forEach((item) => {
            if (!grouped[item.ProductID]) {
                grouped[item.ProductID] = {
                    ProductID: item.ProductID,
                    name: item.ProductName,
                    flavours: [],
                };
            }

            grouped[item.ProductID].flavours.push({
                ProductID: `${item.ProductID}`,
                FlavorID: item.FlavorID,
                name: item.FlavorName,
                Box: item.Box || 0,
                Pouch: item.Pouch || 0,
                Sticker: item.Sticker || 0,
                BoxCase: item.BoxCase || 0,
                PouchCase: item.PouchCase || 0,
                StickerCase: item.StickerCase || 0,
            });
        });

        return Object.values(grouped);
    }

    trackByFn(index: number, item: any): any {
        return item?.id || index;
    }

    Search(opt: string) {
        var value: any = null;
        const filterValue = opt.trim().toLowerCase();

        if (!filterValue) {
            this.data = this.dataSource;
            return;
        }
        var data = this.dataSource.filter((item) => {
            for (value of Object.values(item)) {
                if (value !== null && value !== undefined) {
                    const stringValue = value.toString().toLowerCase();
                    if (stringValue.includes(filterValue)) {
                        return true;
                    }
                }
            }
            return false;
        });
        this.data = data;
    }

    openFilterDrawer() {
        this.IsFilterDrawerVisible = true;
    }

    close(): void {
        this.IsFilterDrawerVisible = false;
    }

    Status: any[] = [];
    Supplier: any[] = [];
    getUniqueFilters() {
        // Unique Status list
        this.Status = [
            ...new Map(
                this.dataSource.map((item) => [
                    item.StatusID,
                    { id: item.StatusID, name: item.Status },
                ])
            ).values(),
        ];

        // Unique Supplier list

        this.Supplier = [
            ...new Map(
                this.dataSource.map((item) => [
                    item.SupplierID,
                    { id: item.SupplierID, name: item.SupplierName },
                ])
            ).values(),
        ];
    }

    onGenerate() {
        this.IsFilterDrawerVisible = false;
        const supplierIds = Array.isArray(this.SupplierID)
            ? this.SupplierID.join(',')
            : this.SupplierID;
        const statusIds = Array.isArray(this.StatusID)
            ? this.StatusID.join(',')
            : this.StatusID;

        this.listService
            .getFlavorOrder(this.fromDate, this.endDate, supplierIds, statusIds)
            .subscribe({
                next: (res) => {
                    this.data = res;
                    this.dataSource = res;
                    this.getUniqueFilters();
                },
                error: (err) => {
                    console.error('Error fetching Flavor Order:', err);
                },
            });
    }

    onReset() {
        this.fromDate = null;
        this.endDate = null;
        this.SupplierID = [];
        this.StatusID = [];
    }

    getCaseQty(detail: any, type: 'Box' | 'Pouch' | 'Sticker') {
        if (detail[type + 'Case'] && detail[type + 'Case'] > 0) {
            return Math.floor(detail[type] / detail[type + 'Case']);
        }
        else { return 0;}
    }
}

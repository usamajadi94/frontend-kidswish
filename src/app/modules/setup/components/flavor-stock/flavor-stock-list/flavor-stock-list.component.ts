import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftTableComponent } from 'app/modules/shared/components/tables/bft-table/bft-table.component';
import { WrapperAddComponent } from 'app/modules/shared/permission-wrapper/wrapper-add/wrapper-add.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FlavorStockComponent } from '../flavor-stock.component';
import { BftSkeletonComponent } from 'app/modules/shared/components/skeleton/bft-skeleton/bft-skeleton.component';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
    selector: 'app-flavor-stock-list',
    standalone: true,
    imports: [
        BftButtonComponent,
        BftTableComponent,
        WrapperAddComponent,
        MatTabsModule,
        CommonModule,
        NzTableModule,
        NzCollapseModule,
        NzCardModule,
        BftSkeletonComponent,
    ],
    templateUrl: './flavor-stock-list.component.html',
    styleUrl: './flavor-stock-list.component.scss',
})
export class FlavorStockListComponent
    extends BaseRoutedComponent
    implements OnInit
{
    private modalService = inject(ModalService);
    private _listService = inject(ListService);

    groupedPacks: any[] = [];
    displayedPacks: any[] = [];
    private displayedPacksMap: Record<string | number, any[]> = {};
    async ngOnInit() {
        await this.getData();
        await this.getProductFlavorData();
    }

    title: string = componentRegister.flavorStock.Title;
    isVisible: boolean = false;
    columns = [
        {
            header: 'Date',
            name: 'Date',
            isSort: true,
            isFilterList: true,
            type: 'date',
        },
        {
            header: 'Flavor',
            name: 'FlavorName',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Current Stock',
            name: 'CurrentStock',
            isSort: true,
            isFilterList: true,
            type: 'number',
            total:true
        },
        {
            header: 'Qty',
            name: 'Qty',
            isSort: true,
            isFilterList: true,
            type: 'number',
             total:true
        },
        {
            header: 'Cases',
            name: 'Cases',
            isSort: true,
            isFilterList: true,
            type: 'number',
             total:true
        },
        {
            header: 'Updated Stock',
            name: 'UpdatedStock',
            isSort: true,
            isFilterList: true,
            type: 'number',
             total:true
        },
        {
            header: 'Modified By',
            name: 'ModifiedBy',
            isSort: true,
            isFilterList: true,
            type: 'text',
        },
        {
            header: 'Modified Date',
            name: 'ModifiedDate',
            isSort: true,
            isFilterList: true,
            type: 'date',
        },
    ];
    data: any[] = [];
    isLoadingStock: boolean = false;
    isLoadingProducts: boolean = false;
    get isLoading(): boolean { return this.isLoadingStock || this.isLoadingProducts; }

    getData() {
        this.isLoadingStock = true;
        this._listService.getFlavorStock().subscribe({
            next: (res: any) => {
                this.data = res;
                // Recompute merged view if products already loaded
                if (this.groupedPacks?.length) {
                    this.combineProductAndStock();
                }
            },
            error: (err) => {
                console.error('Error fetching Flavor Stock:', err);
            },
        });
    }

    onAdd() {
        this.modalService
            .openModal({
                component: FlavorStockComponent,
                title: this.title,
            })
            .afterClose.subscribe((res: boolean) => {
                if (res){
                        this.getData();
                        this.getProductFlavorData();
                } 
            });
    }

    getProductFlavorData() {
        this.isLoadingProducts = true;
        this._listService.getProductWithFlavor().subscribe({
            next: (res) => {
                this.groupedPacks = this.groupByProduct(res);
                this.combineProductAndStock();
            },
            error: (err) => {
                console.error('Error fetching products with Flavor:', err);
            },
        });
    }

    groupByProduct(data: any[]) {
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
                Stock: item.Stock || 0,
            });
        });

        return Object.values(grouped);
    }
    // Merge product->flavours with stock coming from getFlavorStock
    private combineProductAndStock(): void {
        if (!this.groupedPacks?.length) return;    

        this.displayedPacks = (this.groupedPacks || []).map((pack: any) => {
            const { flavours, ...rest } = pack || {};
            return {
                ...rest,
                data: (this.data || [])
                    .filter((item: any) => item.ProductID === pack.ProductID)
                    .sort((a: any, b: any) => {
                        const da = new Date(a?.ModifiedDate || a?.Date || 0).getTime();
                        const db = new Date(b?.ModifiedDate || b?.Date || 0).getTime();
                        return db - da; // desc by ModifiedDate
                    }),
            };
        });

        this.isLoadingStock = false;
        this.isLoadingProducts = false;
    }

    getPackData(productId: string | number): any[] {
        const pack = (this.displayedPacks || []).find((p: any) => p?.ProductID === productId);
        return pack?.data || [];
    }
}

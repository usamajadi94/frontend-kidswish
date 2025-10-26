import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ListService } from 'app/modules/shared/services/list.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTagModule } from 'ng-zorro-antd/tag';
import {
    FactorProductionForm,
    FactoryProduction,
} from '../../models/factory-production';

@Component({
    selector: 'app-order-view',
    standalone: true,
    imports: [
        MatIconModule,
        MatTabsModule,
        MatTableModule,
        MatButtonModule,
        MatTooltipModule,
        NzCollapseModule,
        CommonModule,
        FormsModule,
        NzGridModule,
        NzCardModule,
        NzTagModule,
        BftInputDateComponent,
        BftSelectComponent,
        BftInputNumberComponent,
        BftInputTextComponent,
        BftButtonComponent,
    ],
    templateUrl: './order-view.component.html',
    styleUrl: './order-view.component.scss',
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition(
                'expanded <=> collapsed',
                animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
            ),
        ]),
    ],
})
export class OrderViewComponent {
    Title: string = componentRegister.pipelineOrders.Title;
    private _listService = inject(ListService);
    private _http = inject(HttpClient);
    private _MessageModalService = inject(MessageModalService);

    groupedProducts: any[] = [];
    pipelineOrders: any[] = [];
    currentMonth: Date = new Date();

    // Stats for cards
    monthlyTarget: number = 0;
    producedThisMonth: number = 0;
    pendingOrders: number = 0;

    // Customer orders for second tab
    uniqueCustomerOrders: any[] = [];
    dataSource: MatTableDataSource<any>;
    expandedElement: any | null = null;

    // Record Production form data
    productionForm = new FactorProductionForm();

    // Dropdown options
    productOptions: any[] = [];
    flavorOptions: any[] = [];
    productionRecords: FactoryProduction[] = [];
    filteredProductionRecords: FactoryProduction[] = [];
    todayProductionSummary: any[] = [];

    // Search
    searchTerm: string = '';

    // Footer calculations
    totalProductionRecords: number = 0;
    totalProductionQty: number = 0;

    // Shipment data
    totalShipment: number = 0;
    shipmentRecords: any[] = [];

    // Shipment form data
    shipmentFormData: any = {
        Date: new Date()
    };
    shipmentQuantities: { [key: string]: number } = {};

    // Mat-table columns
    displayedColumns: string[] = [
        'expand',
        'orderNo',
        'customer',
        'totalQty',
        'orderDate',
        'status',
        'modifiedBy',
    ];
    detailColumns: string[] = ['product', 'flavor', 'quantity'];

    ngOnInit(): void {
        this.getProductWithFlavors();
        this.getPipelineOrders();
        this.fetchProductionDetail();
        this.fetchShipmentData();
    }

    onMonthChange() {
        this.getPipelineOrders();
        this.fetchProductionDetail();
        this.fetchShipmentData();
    }
    getProductWithFlavors() {
        this._listService.getProductWithFlavor().subscribe({
            next: (res: any) => {
                this.groupedProducts = this.groupByProduct(res);
                this.productOptions = this.groupedProducts.map((product) => ({
                    value: product.productID,
                    text: product.name,
                }));
                this.updateOrderQuantities();
            },
            error: (err) => {
                console.error('Error fetching products with Flavor:', err);
            },
        });
    }

    getPipelineOrders() {
        this._listService.getPipeLineOrder(this.currentMonth).subscribe({
            next: (res: any) => {
                this.pipelineOrders = res || [];
                console.log(this.pipelineOrders);
                // this.productOptions = [
                //     ...new Map(
                //         this.pipelineOrders.map((product) => [
                //             product.ProductID,
                //             {
                //                 value: product.ProductID,
                //                 text: product.ProductName,
                //             },
                //         ])
                //     ).values(),
                // ];

                this.processCustomerOrders();
                this.updateOrderQuantities();
            },
            error: (err) => {
                console.error('Error fetching pipeline orders:', err);
            },
        });
    }

    processCustomerOrders() {
        // Group orders by CustomerName and CustomerOrderNo
        const customerOrdersMap = new Map();
        this.pipelineOrders.forEach((order) => {
            const key = `${order.CustomerName}_${order.CustomerOrderNo}`;

            if (!customerOrdersMap.has(key)) {
                customerOrdersMap.set(key, {
                    CustomerName: order.CustomerName,
                    CustomerOrderNo: order.CustomerOrderNo,
                    OrderDate: order.OrderDate,
                    Status: order.Status,
                    ModifiedBy: order.ModifiedBy,
                    TotalQty: 0,
                    Details: [],
                });
            }

            const customerOrder = customerOrdersMap.get(key);
            customerOrder.TotalQty += order.Qty || 0;
            customerOrder.Details.push({
                ...order,
                ProductName: order.ProductName,
                FlavorName: order.FlavorName,
            });
        });

        this.uniqueCustomerOrders = Array.from(customerOrdersMap.values());
        this.dataSource = new MatTableDataSource(this.uniqueCustomerOrders);
    }

    toggleRow(element: any) {
        this.expandedElement =
            this.expandedElement === element ? null : element;
    }

    updateOrderQuantities() {
        // Calculate monthly target from all pipeline orders
        this.monthlyTarget = this.pipelineOrders.reduce(
            (total, order) => total + (order.Qty || 0),
            0
        );

        // Create a map to sum quantities by ProductID and FlavorID from pipeline orders
        const orderSummary: { [key: string]: number } = {};

        this.pipelineOrders.forEach((order) => {
            const key = `${order.ProductID}_${order.FlavorID}`;
            orderSummary[key] = (orderSummary[key] || 0) + (order.Qty || 0);
        });

        // Create a map to sum produced quantities by ProductID and FlavorID from production records
        const producedSummary: { [key: string]: number } = {};

        this.productionRecords.forEach((record) => {
            const key = `${record.ProductID}_${record.FlavourID}`;
            producedSummary[key] =
                (producedSummary[key] || 0) + (record.Qty || 0);
        });

        // Update the grouped products with order quantities and produced quantities
        this.groupedProducts.forEach((product) => {
            product.flavours.forEach((flavor: any) => {
                const key = `${product.productID}_${flavor.id}`;
                const orderQty = orderSummary[key] || 0;
                const producedQty = producedSummary[key] || 0;

                flavor.targetQuantity = orderQty;
                flavor.produced = producedQty;
                flavor.remaining = orderQty - producedQty;
            });
        });

        // Calculate pending orders as Monthly Target - Produced This Month
        this.pendingOrders = this.monthlyTarget - this.producedThisMonth;
    }

    groupByProduct(data: any[]): any[] {
        const grouped: { [key: number]: any } = {};

        data.forEach((item) => {
            if (!grouped[item.ProductID]) {
                grouped[item.ProductID] = {
                    productID: item.ProductID,
                    name: item.ProductName,
                    category: item.ProductCategory,
                    BoxCase:item.BoxCase,
                    flavours: [],
                };
            }

            grouped[item.ProductID].flavours.push({
                name: item.FlavorName,
                id: item.FlavorID,
                targetQuantity: 0, // Will be updated from pipeline orders
                produced: 0, // Set to 0 for now
                remaining: 0, // Will be calculated
                currentStock: Math.floor(Math.random() * 100), // Mock data for demo,
                BoxCase:item.BoxCase
            });
        });

        return Object.values(grouped);
    }

    // Production form methods

    onProductChange() {
        this.productionForm.FlavourID = null;
        this.flavorOptions = [];
        if (this.productionForm.ProductID) {
            const selectedProduct = this.groupedProducts.find(
                (p) => p.productID == this.productionForm.ProductID
            );
            if (selectedProduct) {
                this.flavorOptions = selectedProduct.flavours.map(
                    (flavor: any) => ({
                        value: flavor.id,
                        text: flavor.name,
                    })
                );
                this.updateCaseQty();
            }
        }
    }

    saveProduction() {
        if (this.productionForm.ID && this.productionForm.ID > 0) {
            // Update existing record
            this._http
                .put(
                    `${apiUrls.productionOrder}/${this.productionForm.ID}`,
                    this.productionForm
                )
                .subscribe({
                    next: (res: any) => {
                        this._MessageModalService.success(
                            'Production record updated successfully!'
                        );
                        this.productionForm = new FactoryProduction();
                        this.fetchProductionDetail();
                    },
                    error: (err) => {
                        this._MessageModalService.error(
                            'Error updating production record'
                        );
                        console.error('Update error:', err);
                    },
                });
        } else {
            // Create new record
        this._http
            .post(apiUrls.productionOrder, this.productionForm)
                .subscribe({
                    next: (res: any) => {
                        this._MessageModalService.success(
                            'Production record created successfully!'
                        );
                this.productionForm = new FactoryProduction();
                this.fetchProductionDetail();
                    },
                    error: (err) => {
                        this._MessageModalService.error(
                            'Error creating production record'
                        );
                        console.error('Create error:', err);
                    },
                });
        }
    }

    getTotalToday() {
        return this.todayProductionSummary.reduce(
            (total, item) => total + item.quantity,
            0
        );
    }

    fetchProductionDetail() {
        this._listService
            .getProductionDetail(this.currentMonth)
            .subscribe((res: any) => {
                this.productionRecords = res || [];

                this.applySearch();
                this.updateTodayProductionSummary();
                this.producedThisMonth =
                    this.calculateTotalProductionForMonth();
                this.updateOrderQuantities();
            console.log('productionDetail', res);
            });
    }

    applySearch() {
        // Apply search filter
        if (this.searchTerm.trim()) {
            this.filteredProductionRecords = this.productionRecords.filter(
                (record) =>
                    record.ProductName?.toLowerCase().includes(
                        this.searchTerm.toLowerCase()
                    ) ||
                    record.FlavorName?.toLowerCase().includes(
                        this.searchTerm.toLowerCase()
                    ) ||
                    record.ModifiedBy?.toLowerCase().includes(
                        this.searchTerm.toLowerCase()
                    )
            );
        } else {
            this.filteredProductionRecords = this.productionRecords;
        }

        // Calculate footer totals
        this.calculateFooterTotals();
    }

    calculateFooterTotals() {
        this.totalProductionRecords = this.filteredProductionRecords.length;
        this.totalProductionQty = this.filteredProductionRecords.reduce(
            (sum, record) => sum + (record.Qty || 0),
            0
        );
    }

    calculateTotalProductionForMonth() {
        // Calculate total production for the month (all records, not filtered)
        return this.productionRecords.reduce(
            (sum, record) => sum + (record.Qty || 0),
            0
        );
    }

    onSearchChange() {
        this.applySearch();
    }

    editProduction(record: FactorProductionForm) {
        const selectedProduct = this.groupedProducts.find(
            (p) => p.productID == record.ProductID
        );
        if (selectedProduct) {
            this.flavorOptions = selectedProduct.flavours.map(
                (flavor: any) => ({
                    value: flavor.id,
                    text: flavor.name,
                })
            );
        }
        this.productionForm = {
            ID: record.ID,
            ProductID: record.ProductID,
            FlavourID: record.FlavourID,
            Qty: record.Qty,
            Date: record.Date,
            QtyCase:record.QtyCase
        };

        // Scroll to form
        document
            .querySelector(
                '.bg-white.rounded-xl.shadow-sm.border.border-gray-100.p-6'
            )
            ?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
    }

    deleteProduction(record: FactoryProduction) {
        this._http.delete(`${apiUrls.productionOrder}/${record.ID}`).subscribe({
            next: (res: any) => {
                this._MessageModalService.success(
                    'Production record deleted successfully!'
                );
                this.fetchProductionDetail();
            },
            error: (err) => {
                this._MessageModalService.error(
                    'Error deleting production record'
                );
                console.error('Delete error:', err);
            },
        });
    }

    updateTodayProductionSummary() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter today's production records
        const todayRecords = this.productionRecords.filter((record) => {
            const recordDate = new Date(record.Date);
            recordDate.setHours(0, 0, 0, 0);
            return recordDate.getTime() === today.getTime();
        });

        // Group by flavor and sum quantities
        const flavorMap = new Map<string, number>();

        todayRecords.forEach((record) => {
            const flavorKey = `${record.ProductName} - ${record.FlavorName}`;
            const currentQty = flavorMap.get(flavorKey) || 0;
            flavorMap.set(flavorKey, currentQty + (record.Qty || 0));
        });

        // Convert map to array
        this.todayProductionSummary = Array.from(flavorMap.entries()).map(
            ([flavor, quantity]) => ({
                flavor,
                quantity,
            })
        );
    }

    // ============================================
    // SHIPMENT TAB METHODS
    // ============================================

    saveShipment() {
        // Create shipment records only for flavors with quantities > 0
        const shipmentRecords: any[] = [];
        
        Object.keys(this.shipmentQuantities).forEach(key => {
            const quantity = this.shipmentQuantities[key];
            if (quantity && quantity > 0) {
                const [productID, flavourID] = key.split('_');
                shipmentRecords.push({
                    ProductID: parseInt(productID),
                    FlavourID: parseInt(flavourID),
                    Qty: quantity,
                    Date: this.shipmentFormData.Date
                });
            }
        });

        if (shipmentRecords.length === 0) {
            this._MessageModalService.warning('Please enter quantities for at least one flavor');
            return;
        }

        // Save each record individually (same as production)
        let completedRequests = 0;
        const totalRequests = shipmentRecords.length;
        
        shipmentRecords.forEach(record => {
            this._http.post(apiUrls.shipmentController, record)
                .subscribe({
                    next: (res: any) => {
                        completedRequests++;
                        if (completedRequests === totalRequests) {
                            this._MessageModalService.success('Shipment saved successfully!');
                            this.fetchShipmentData();
                            this.clearShipmentForm();
                        }
                    },
                    error: (err) => {
                        this._MessageModalService.error('Error saving shipment');
                        console.error('Shipment save error:', err);
                    }
                });
        });
    }

    clearShipmentForm() {
        this.shipmentFormData = {
            Date: new Date()
        };
        this.shipmentQuantities = {};
    }

    // ============================================
    // SHIPMENT DATA FETCH METHODS
    // ============================================

    fetchShipmentData() {
        this._listService.getShipmentDetail(this.currentMonth).subscribe({
            next: (res: any) => {
                this.shipmentRecords = res || [];
               this.totalShipment = res && res.length > 0 ? res[0].Qty || 0 : 0;
            },
            error: (err) => {
                console.error('Error fetching shipment data:', err);
                this.totalShipment = 0;
                this.shipmentRecords = [];
            }
        });
    }

    getCaseQty(detail: any, type: 'Box' | 'Pouch' | 'Sticker',Qty:any) {
        if (detail[Qty] && detail[type + 'Case'] > 0) {
            return Math.floor(detail[Qty] / detail[type + 'Case']);
        }
        else { return 0;}
    }

    updateCaseQty(){
        if (this.productionForm.ProductID) {
            const selectedProduct = this.groupedProducts.find(
                (p) => p.productID == this.productionForm.ProductID
            );
        this.productionForm.QtyCase = this.getProductionFormCase(selectedProduct,"Box",this.productionForm.Qty);
        }
    }
    
    getProductionFormCase(detail: any, type: 'Box' | 'Pouch' | 'Sticker',Qty:any) {
        if (Qty && detail[type + 'Case'] > 0) {
            return Math.floor(Qty / detail[type + 'Case']);
        }
        else { return 0;}
    }
}

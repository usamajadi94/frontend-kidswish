import { inject, Injectable } from '@angular/core';
import { QueryService } from 'app/core/Base/services/query.service';
import { apiUrls } from './api-url';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiResponse } from 'app/core/Base/interface/IResponses';
import { VW_Modules } from 'app/modules/security/models/VW_Permissions';

@Injectable({
    providedIn: 'root',
})
export class DrpService {
    private _QueryService = inject(QueryService);

    getModulesAndSections(): Observable<VW_Modules[]> {
        return this._QueryService.get<VW_Modules[]>(`${apiUrls.moduleGetController}`).pipe(
            map((res: ApiResponse<VW_Modules[]>) => res.Data),
            catchError(this.handleError)
        );
    }

    getExpenseCategoryDrp() {
        return this._QueryService.getQuery('getExpenseCategoryDrp');
    }

    getPaymentCategoryDrp() {
        return this._QueryService.getQuery('getPaymentCategoryDrp');
    }

    getOrdersByCustomerDrp(customerId: number) {
        return this._QueryService.getQuery('getOrdersByCustomerDrp', { customerId });
    }

    getDistributorDrp() {
        return this._QueryService.getQuery('getDistributorDrp');
    }

    getVendorTypeDrp() {
        return this._QueryService.getQuery('getVendorTypeDrp');
    }

    getBankAccountDrp() {
        return this._QueryService.getQuery('getBankAccountDrp');
    }

    getVendorDrp() {
        return this._QueryService.getQuery('getVendorDrp');
    }

    getDistributorCustomerDrp() {
        return this._QueryService.getQuery('getDistributorCustomerDrp');
    }

    getPettyCashDrp() {
        return this._QueryService.getQuery('getPettyCashDrp');
    }

    getUsersDrp() {
        return this._QueryService.getQuery('getUsersDrp');
    }

    getLegalEntityDrp() {
        return this._QueryService.getQuery('getLegalEntityDrp');
    }

    getPaymentMethodDrp() {
        return this._QueryService.getQuery('getPaymentMethodDrp');
    }

    // Used by main/reports modules
    getCustomerInformationDrp() {
        return this._QueryService.getQuery('getCustomerInformationDrp');
    }

    getProductsDrp() {
        return this._QueryService.getQuery('getProductsDrp');
    }

    private handleError(error: any) {
        return throwError(() => error);
    }
}

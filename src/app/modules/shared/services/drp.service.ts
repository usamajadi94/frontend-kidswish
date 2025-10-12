import { inject, Injectable } from '@angular/core';
import { QueryService } from 'app/core/Base/services/query.service';
import { apiUrls } from './api-url';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { ApiResponse } from 'app/core/Base/interface/IResponses';
import { VW_Modules } from 'app/modules/security/models/VW_Permissions';

@Injectable({
    providedIn: 'root',
})
export class DrpService {
    private _QueryService = inject(QueryService);

    getSuppliersDrp() {
        return this._QueryService.getQuery('getSupplierInformationDrp');
    }

    getCategoriesDrp() {
        return this._QueryService.getQuery('getItemTypeDrp');
    }
 
    getCustomerInformationDrp() {
        return this._QueryService.getQuery('getCustomerInformationDrp');
    }

    getVehicleInformationDrp() {
        return this._QueryService.getQuery('getVehicleInformationDrp');
    }

    /*
    getModulesAndSections() {
        return this._QueryService.getQuery('getModulesAndSections');
    }
    */


    getModulesAndSections(): Observable<VW_Modules[]> {
        return this._QueryService.get<VW_Modules[]>(`${apiUrls.moduleGetController}`).pipe(
            map((res: ApiResponse<VW_Modules[]>) => res.Data),
            catchError(this.handleError)
        );
    }
    getExpenseCategoryDrp() {
        return this._QueryService.getQuery('getExpenseCategoryDrp');
    }

    getPaymentMethodDrp() {
        return this._QueryService.getQuery('getPaymentMethodDrp');
    }
    
    getSalaryTypes() {
        return this._QueryService.getQuery('getSalaryTypes');
    }

    getEmployeeHistoyByEmployee(employeeID: number) {
        return this._QueryService.getQuery('getEmployeeHistoyByEmployee',{employeeid:employeeID});
    }

    private handleError(error: any) {
        console.error('API Error:', error);
        return throwError(() => error);
    }
}

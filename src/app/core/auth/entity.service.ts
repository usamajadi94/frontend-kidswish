import { HttpClient} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EntityService {
    private _httpClient = inject(HttpClient);
    getEntites() {
        return this._httpClient
            .get(apiUrls.entity)
            .pipe(
                switchMap((response: any) => {
                    return of(response);
                })
            );
    }
}

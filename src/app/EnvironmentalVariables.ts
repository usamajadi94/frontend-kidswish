import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class EnvironmentalVariables {
    private readonly _env: IEnvironmentalVariables;

    constructor() {
        this._env = environment as unknown as IEnvironmentalVariables;
    }

    public get get(): IEnvironmentalVariables {
        return this._env;
    }
}

export interface IEnvironmentalVariables {
    production: boolean;
    env: 'local' | 'prd';
    site: {
        baseUrl: string;
    };
    apiRoot: string;
    'site-config': {
        environment: string;
    };
    services: {}; //like Azure, Firbase..
}

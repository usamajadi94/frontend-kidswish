import { IEnvironmentalVariables } from '../app/EnvironmentalVariables';

export const environment: IEnvironmentalVariables = {
    production: true,
    apiRoot: 'https://RAILWAY_BACKEND_URL_HERE/',
    env: 'prd',
    site: {
        baseUrl: '',
    },
    'site-config': {
        environment: 'production',
    },
    services: {},
};

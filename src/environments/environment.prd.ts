import { IEnvironmentalVariables } from '../app/EnvironmentalVariables';

export const environment: IEnvironmentalVariables = {
    production: true,
    apiRoot: 'https://kidswish-api-production.up.railway.app/',
    env: 'prd',
    site: {
        baseUrl: '',
    },
    'site-config': {
        environment: 'production',
    },
    services: {},
};

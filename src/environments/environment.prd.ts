import { IEnvironmentalVariables } from '../app/EnvironmentalVariables';

export const environment: IEnvironmentalVariables = {
    production: true,
    apiRoot: 'https://dmsapi.browsefytech.com/',
    env: 'prd',
    site: {
        baseUrl: '',
    },
    'site-config': {
        environment: 'production',
    },
    services: {},
};

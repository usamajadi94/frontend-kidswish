import { IEnvironmentalVariables } from '../app/EnvironmentalVariables';

export const environment: IEnvironmentalVariables = {
    production: true,
    // apiRoot: 'http://cloudfusion-001-site10.qtempurl.com/',
    apiRoot: "http://api.dabossleaf.com/",
    env: 'prd',
    site: {
        baseUrl: '',
    },
    'site-config': {
        environment: 'production',
    },
    services: {},
};

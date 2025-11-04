import { IEnvironmentalVariables } from '../app/EnvironmentalVariables';
export const environment: IEnvironmentalVariables = {
    production: false,
    // apiRoot: 'http://cloudfusion-001-site10.qtempurl.com/',
    apiRoot: "http://api.dabossleaf.com/",

    // apiRoot: 'https://localhost:44327/',
    // apiRoot: 'http://cloudfusion-001-site10.qtempurl.com/',
    // apiRoot: 'https://dmsapi.browsefytech.com/',
    env: 'local',
    site: {
        baseUrl: '',
    },
    'site-config': {
        environment: 'default',
    },
    services: {},
};

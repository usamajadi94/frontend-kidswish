import { IEnvironmentalVariables } from '../app/EnvironmentalVariables';
export const environment: IEnvironmentalVariables = {
    production: false,
    //apiRoot: 'http://cloudfusion-001-site10.qtempurl.com/',
    // apiRoot: "https://api.dabossleaf.com/",

    apiRoot: 'https://localhost:44327/',

    env: 'local',
    site: {
        baseUrl: '',
    },
    'site-config': {
        environment: 'default',
    },
    services: {},
};

import { IEnvironmentalVariables } from '../app/EnvironmentalVariables';
export const environment: IEnvironmentalVariables = {
    production: false,
    //apiRoot: 'http://cloudfusion-001-site10.qtempurl.com/',
    // apiRoot: "https://api.dabossleaf.com/",

    apiRoot: 'http://localhost:3000/',

    env: 'local',
    site: {
        baseUrl: '',
    },
    'site-config': {
        environment: 'default',
    },
    services: {},
};

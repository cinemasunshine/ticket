// tslint:disable:no-http-string
/**
 * 環境変数test
 */
export const environment = {
    production: false,
    version: '1.0.0',

    REGION: 'ap-northeast-1', // identity poolのリージョンを指定する
    IDENTITY_POOL_ID: 'ap-northeast-1:b153d3f1-5e67-468e-8c69-ab938cf3d21e', // IDENTITY POOLのID(AWS CONSOLEで確認)
    USER_POOL_ID: '',
    CLIENT_ID: '',

    REKOGNITION_BUCKET: 'rekognition-pics',
    ALBUM_NAME: 'usercontent',
    BUCKET_REGION: 'us-east-1',

    DDB_TABLE_NAME: 'LoginTrail',
    TOKEN_ISSUER: '',

    PORTAL_SITE: 'http://ssk-portal2018-frontend-win-test.azurewebsites.net',
    ENTRANCE_SERVER_URL: 'https://d24x7394fq3aqi.cloudfront.net',

    CLOSE_THEATERS: ['101'],

    ANALYTICS_ID: 'UA-99018492-5',

    PRE_SALE_DIFFERENCE_DAY: '2'

};

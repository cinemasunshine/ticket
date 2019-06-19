/**
 * PurchaseComponent
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@motionpicture/sskts-api-javascript-client';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment';
import { AwsCognitoService } from '../../../services/aws-cognito/aws-cognito.service';
import { IConfirm, MaintenanceService } from '../../../services/maintenance/maintenance.service';
import { SasakiService } from '../../../services/sasaki/sasaki.service';
import { IPurchaseConditions, PurchaseSort, SelectService } from '../../../services/select/select.service';
import { MemberType, UserService } from '../../../services/user/user.service';

type IMovieTheater = factory.seller.IOrganization<factory.seller.IAttributes<factory.organizationType>>;
type IEvent = factory.chevre.event.screeningEvent.IEvent;
type ICOAInfo = factory.event.screeningEvent.ICOAInfo;
type ITimeOrder = IEvent;

interface IFilmOrder {
    id: string;
    films: IEvent[];
}

interface IDate {
    value: string;
    display: {
        year: string;
        month: string;
        week: string;
        day: string;
    };
    preSale: boolean;
    serviceDay: string;
}

@Component({
    selector: 'app-purchase',
    templateUrl: './purchase.component.html',
    styleUrls: ['./purchase.component.scss']
})
/**
 * チケット購入
 * @class PurchaseComponent
 * @implements OnInit
 */
export class PurchaseComponent implements OnInit {
    public isLoading: boolean;
    public theaters: IMovieTheater[];
    public dateList: IDate[];
    public filmOrder: IFilmOrder[];
    public timeOrder: ITimeOrder[];
    public screeningEvents: IEvent[];
    public conditions: IPurchaseConditions;
    public error: string;
    public purchaseSort: typeof PurchaseSort;
    public isPreSale: boolean;
    public maintenanceInfo: IConfirm;

    constructor(
        private router: Router,
        private sasaki: SasakiService,
        private select: SelectService,
        private user: UserService,
        private maintenance: MaintenanceService,
        private awsCognito: AwsCognitoService
    ) {
        this.purchaseSort = PurchaseSort;
    }

    /**
     * 初期化
     * @method ngOnInit
     */
    public async ngOnInit() {
        this.isLoading = true;
        try {
            this.maintenanceInfo = await this.maintenance.confirm();
            if (this.maintenanceInfo.isMaintenance) {
                this.isLoading = false;

                return;
            }
            this.conditions = this.select.data.purchase;
            if (this.user.isMember() && this.conditions.theater === '') {
                // 会員
                const theater = this.user.getWellGoTheaterCode();
                this.conditions.theater = theater !== undefined ? theater : '';
            }
            await this.initialize();
            localStorage.removeItem('schedule');
        } catch (error) {
            this.router.navigate(['/error', { redirect: '/purchase' }]);
            console.error('PurchaseComponent.ngOnInit', error);
        }

        this.isLoading = false;
    }

    /**
     * 初期化
     */
    private async initialize() {
        this.theaters = [];
        this.dateList = [];
        this.filmOrder = [];
        this.timeOrder = [];
        this.theaters = await this.getTheaters();
        const findResult = this.theaters.find(theater =>
            theater.location !== undefined && theater.location.branchCode === this.conditions.theater);
        if (findResult === undefined) {
            this.conditions.theater = '';
        }
        if (this.conditions.theater !== '') {
            this.screeningEvents = await this.getScreeningEvents();
            this.createDateList();
            this.createSchedule();
        }
    }

    /**
     * 劇場変更
     */
    public async changeTheater() {
        this.isLoading = true;
        this.select.data.purchase.theater = this.conditions.theater;
        this.select.save();
        try {
            await this.sasaki.getServices();
            this.screeningEvents = await this.getScreeningEvents();
            this.createDateList();
            this.createSchedule();
        } catch (error) {
            this.router.navigate(['/error', { redirect: '/purchase' }]);
            console.error('PurchaseComponent.changeTheater', error);
        }
        this.isLoading = false;
    }

    /**
     * ソート変更
     * @method changeSort
     */
    public async changeSort(sort: PurchaseSort) {
        this.select.data.purchase.sort = sort;
        this.select.save();
    }

    /**
     * 日付選択
     * @method selectDate
     */
    public async selectDate(date: IDate) {
        this.conditions.date = date.value;
        this.select.data.purchase.date = this.conditions.date;
        this.select.save();
        this.createSchedule();
    }

    /**
     * スケジュール更新
     */
    public async update() {
        this.isLoading = true;
        try {
            await this.initialize();
        } catch (error) {
            this.router.navigate(['/error', { redirect: '/purchase' }]);
            console.error('PurchaseComponent.update', error);
        }
        this.isLoading = false;
    }

    /**
     * パフォーマンス選択
     * @method performanceSelect
     */
    public async performanceSelect(performance: IEvent) {
        if (performance.offers === undefined || performance.offers.availability === 0) {
            return;
        }
        let params;
        if (this.user.isMember()) {
            params = {
                id: performance.identifier,
                native: '1',
                member: MemberType.Member,
                clientId: this.sasaki.auth.options.clientId
            };
        } else {
            if (this.awsCognito.credentials === undefined) {
                throw new Error('awsCognito.credentials is undefined');
            }
            params = {
                id: performance.identifier,
                identityId: this.awsCognito.credentials.identityId,
                native: '1',
                member: MemberType.NotMember,
                clientId: this.sasaki.auth.options.clientId
            };
        }
        let query = '';
        for (let i = 0; i < Object.keys(params).length; i++) {
            const key = Object.keys(params)[i];
            const value = (<any>params)[key];
            if (i > 0) {
                query += '&';
            }
            query += `${key}=${value}`;
        }
        const url = `${environment.ENTRANCE_SERVER_URL}/ticket/index.html?${query}`;
        location.href = url;
    }

    /**
     * 劇場一覧取得
     */
    private async getTheaters() {
        await this.sasaki.getServices();
        const sellerSearchResult = await this.sasaki.seller.search({ typeOfs: [factory.organizationType.MovieTheater] });
        const theaters = sellerSearchResult.data.filter((s) => {
            return (s.location !== undefined
                && s.location.branchCode !== undefined
                && s.location.branchCode !== '');
        });
        // 除外劇場処理
        const excludeTheatersResult = await this.maintenance.excludeTheaters();
        if (!excludeTheatersResult.isExclude) {
            return theaters;
        }

        return theaters.filter((theater) => {
            const excludeTheater = excludeTheatersResult.theaters.find((excludeCode) => {
                return (theater.location === undefined
                    || theater.location.branchCode === undefined
                    || excludeCode === theater.location.branchCode);
            });

            return (excludeTheater === undefined);
        });
    }

    /**
     * スケジュール取得
     */
    private async getScreeningEvents() {
        await this.sasaki.getServices();
        const branchCode = this.conditions.theater;
        const findResult = this.theaters.find(theater => theater.location !== undefined && theater.location.branchCode === branchCode);
        if (findResult === undefined) {
            return [];
        }
        const screeningEvents = await this.sasaki.event.searchScreeningEvents({
            typeOf: factory.chevre.eventType.ScreeningEvent,
            eventStatuses: [factory.chevre.eventStatusType.EventScheduled],
            startFrom: moment().toDate(),
            startThrough: moment().add(5, 'week').toDate(),
            sort: { startDate: factory.sortType.Ascending },
            superEvent: { locationBranchCodes: [branchCode] }
        });

        const filterResult = screeningEvents.data.filter((screeningEvent) => {
            if (screeningEvent.coaInfo === undefined) {
                return false;
            }
            const now = moment().toDate();
            let reservationStartDate = moment(screeningEvent.coaInfo.rsvEndDate).toDate();
            const alternativeHeadline = screeningEvent.superEvent.alternativeHeadline;
            if (alternativeHeadline === undefined
                || alternativeHeadline === null
                || typeof alternativeHeadline !== 'string'
                || alternativeHeadline.length !== 12
                || alternativeHeadline.match(/^[0-9]+$/) === null) {
                return true;
            }
            const formatResult = (alternativeHeadline.length === 12)
                // tslint:disable-next-line:max-line-length
                ? `${alternativeHeadline.slice(0, 4)}-${alternativeHeadline.slice(4, 6)}-${alternativeHeadline.slice(6, 8)} ${alternativeHeadline.slice(8, 10)}:${alternativeHeadline.slice(10, 12)}`
                : alternativeHeadline;
            if (alternativeHeadline !== undefined
                && alternativeHeadline !== null
                && moment(formatResult).isValid()) {
                reservationStartDate = moment(formatResult).toDate();
            }
            return (now > reservationStartDate);
        });

        return filterResult;
    }

    /**
     * 先行販売かどうかをチェックする
     */
    private checkEventPreSale(event: IEvent): boolean {
        const salesDate = moment().add(2, 'days').format('YYYYMMDD');
        const startDate = moment(event.startDate).format('YYYYMMDD');
        const today = moment().format('YYYYMMDD');
        const PRE_SALE = '1'; // 先行販売
        return event.coaInfo !== undefined &&
            event.coaInfo.rsvStartDate <= today &&
            event.coaInfo.flgEarlyBooking === PRE_SALE &&
            salesDate < startDate;
    }

    /**
     * 日付作成
     */
    private createDateList() {
        const result: IDate[] = [];
        const limitDate = moment().add(7, 'days').format('YYYYMMDD');
        const today = moment().format('YYYYMMDD');
        this.screeningEvents.forEach((screeningEvent) => {
            if (screeningEvent.coaInfo === undefined) {
                return;
            }
            const coaInfo: ICOAInfo = screeningEvent.coaInfo;
            const startDate = moment(screeningEvent.startDate).format('YYYYMMDD');
            const isSalse = coaInfo.rsvStartDate <= today;
            if (!isSalse && startDate >= limitDate) {
                return;
            }
            const findResult = result.find((date) => coaInfo.dateJouei === date.value);
            if (findResult === undefined) {
                const date = moment(screeningEvent.coaInfo.dateJouei);
                result.push({
                    value: screeningEvent.coaInfo.dateJouei,
                    display: {
                        month: date.format('MM'),
                        week: date.format('ddd'),
                        day: date.format('DD'),
                        year: date.format('YYYY')
                    },
                    preSale: this.checkEventPreSale(screeningEvent),
                    serviceDay: coaInfo.nameServiceDay
                });
            } else if (this.checkEventPreSale(screeningEvent)) {
                findResult.preSale = true;
            }
        });
        this.dateList = result;
        this.isPreSale = (this.dateList.find(date => date.preSale) !== undefined);
    }

    /**
     * スケジュール作成
     */
    private createSchedule() {
        this.filmOrder = [];
        this.timeOrder = [];
        const today = moment().format('YYYYMMDD');
        const limitDate = moment().add(7, 'days').format('YYYYMMDD');
        const searchDate = this.conditions.date < today ? today : this.conditions.date;
        this.conditions.date = searchDate;
        const dateFilterResult = this.screeningEvents
            .filter(screeningEvent => screeningEvent.coaInfo !== undefined && screeningEvent.coaInfo.dateJouei === searchDate);

        const displayFilterResult = dateFilterResult
            .filter(screeningEvent => (screeningEvent.coaInfo !== undefined
                && (screeningEvent.coaInfo.rsvStartDate <= today
                    || this.checkEventPreSale(screeningEvent)
                    || screeningEvent.coaInfo.dateJouei <= limitDate)));

        this.timeOrder = displayFilterResult;
        displayFilterResult.forEach((screeningEvent) => {
            if (screeningEvent.coaInfo === undefined) {
                return;
            }
            const coaInfo: ICOAInfo = screeningEvent.coaInfo;
            const film = this.filmOrder.find((event) => {
                return (coaInfo !== undefined && event.id === (coaInfo.titleCode + coaInfo.titleBranchNum));
            });
            if (film === undefined) {
                this.filmOrder.push({
                    id: (coaInfo.titleCode + coaInfo.titleBranchNum),
                    films: [screeningEvent]
                });
            } else {
                film.films.push(screeningEvent);
            }
        });
    }

}

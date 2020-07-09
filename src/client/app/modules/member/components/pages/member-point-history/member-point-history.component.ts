import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@cinerino/api-javascript-client';
import { CinerinoService, UserService } from '../../../../../services';

@Component({
    selector: 'app-member-point-history',
    templateUrl: './member-point-history.component.html',
    styleUrls: ['./member-point-history.component.scss']
})
export class MemberPointHistoryComponent implements OnInit {
    public isLoading: boolean;
    public accountMoneyTransferActions: factory.pecorino.action.transfer.moneyTransfer.IAction<factory.accountType.Point>[];

    constructor(
        public user: UserService,
        private router: Router,
        private cinerino: CinerinoService
    ) { }

    /**
     * 初期化
     * @method ngOnInit
     */
    public async ngOnInit() {
        this.isLoading = true;
        try {
            this.cinerino.getServices();
            await this.user.updateAccount();
            if (this.user.data.accounts.length === 0) {
                throw new Error('account is not found');
            }
            const result = await this.cinerino.ownerShipInfo.searchAccountMoneyTransferActions<factory.accountType.Point>({
                id: 'me',
                accountType: factory.accountType.Point,
                accountNumber: this.user.data.accounts[0].typeOfGood.accountNumber,
                limit: 100
            });
            this.accountMoneyTransferActions =
                result.data.filter(a => a.actionStatus === factory.pecorino.actionStatusType.CompletedActionStatus);
        } catch (error) {
            console.error(error);
            this.router.navigate(['/error', { redirect: '/member/point/history' }]);
        }
        this.isLoading = false;
    }

}

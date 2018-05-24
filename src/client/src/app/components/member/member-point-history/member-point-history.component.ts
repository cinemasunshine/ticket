import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { factory } from '@motionpicture/sskts-api-javascript-client';
import { SasakiService } from '../../../services/sasaki/sasaki.service';
import { UserService } from '../../../services/user/user.service';

@Component({
    selector: 'app-member-point-history',
    templateUrl: './member-point-history.component.html',
    styleUrls: ['./member-point-history.component.scss']
})
export class MemberPointHistoryComponent implements OnInit {
    public isLoading: boolean;
    public accountMoneyTransferActions: factory.pecorino.action.transfer.moneyTransfer.IAction[];
    public transactionType: typeof factory.pecorino.transactionType;

    constructor(
        public user: UserService,
        private router: Router,
        private sasaki: SasakiService
    ) { }

    public async ngOnInit() {
        this.transactionType = factory.pecorino.transactionType;
        this.isLoading = true;
        try {
            this.sasaki.getServices();
            await this.user.updateAccount();
            if (this.user.data.account === undefined) {
                throw new Error('account is undefined');
            }
            this.accountMoneyTransferActions = await this.sasaki.person.searchAccountMoneyTransferActions({
                personId: 'me',
                accountNumber: this.user.data.account.accountNumber
            });
            console.log(this.accountMoneyTransferActions);
        } catch (err) {
            this.router.navigate(['/error', { redirect: '/member/point/history' }]);
            console.log('MemberPointHistoryComponent.ngOnInit', err);
        }
        this.isLoading = false;
    }

}

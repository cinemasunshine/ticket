import { Component, Input, OnInit } from '@angular/core';
import { factory } from '@cinerino/api-javascript-client';
import * as moment from 'moment';

@Component({
    selector: 'app-point-history-list',
    templateUrl: './point-history-list.component.html',
    styleUrls: ['./point-history-list.component.scss']
})
export class PointHistoryListComponent implements OnInit {
    @Input() public action: factory.pecorino.action.transfer.moneyTransfer.IAction<factory.accountType.Point>;
    @Input() public accountNumber: string;
    public circle: string;
    public description: string;
    public amount: string;
    public date: string;

    constructor() { }

    public ngOnInit() {
        const transactionType = factory.pecorino.transactionType;
        this.date = moment(this.action.endDate).format('YYYY年MM月DD日 HH:mm');
        this.description = (this.action.description !== undefined)
            ? this.action.description.replace(/\,/g, '<br>')
            : '';
        if (this.action.purpose.typeOf === transactionType.Deposit) {
            this.circle = (this.action.amount < 0) ? 'blue' : '';
            this.amount = (this.action.amount < 0) ? String(this.action.amount) : `+${this.action.amount}`;
            return;
        }

        if (this.action.purpose.typeOf === transactionType.Transfer) {
            const isMySelf = (<any>this.action.fromLocation).accountNumber === this.accountNumber;
            this.circle = 'blue';
            this.amount = (isMySelf) ? String(this.action.amount * -1) : String(this.action.amount);
            return;
        }

        if (this.action.purpose.typeOf === transactionType.Withdraw) {
            this.circle = (this.action.amount > 0) ? 'blue' : '';
            this.amount = (this.action.amount > 0) ? String(this.action.amount * -1) : String(this.action.amount);
            return;
        }
    }

}

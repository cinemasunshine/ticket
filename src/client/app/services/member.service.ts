import { Injectable } from '@angular/core';
import { factory } from '@cinerino/sdk';
import * as moment from 'moment';
import { CinerinoService } from './cinerino.service';
import { UtilService } from './util.service';

@Injectable({
    providedIn: 'root'
})
export class MemberService {

    constructor(
        private cinerinoService: CinerinoService,
        private utilService: UtilService
    ) { }

    /**
     * 登録
     * @method register
     */
    public async register(params: {
        programMembershipRegistered: boolean;
        theaterBranchCode: string;
    }) {
        await this.cinerinoService.getServices();

        const { theaterBranchCode, programMembershipRegistered } = params;
        // 販売劇場検索
        const searchResult = await this.cinerinoService.seller.search({
            branchCode: { $eq: theaterBranchCode },
        });
        const seller = searchResult.data[0];
        if (seller.id === undefined) {
            throw new Error('programMemberships is Injustice');
        }

        // 会員プログラム登録
        await this.cinerinoService.person.registerProgramMembership({
            sellerId: seller.id,
            agent: {
                additionalProperty: (programMembershipRegistered)
                    ? undefined
                    : [{ name: 'firstMembership', value: '1' }]
            }
        });
    }

    /**
     * 登録判定
     */
    public async isRegister() {
        await this.cinerinoService.getServices();
        const time = 3000;
        const limit = 20;
        let count = 0;
        return new Promise<boolean>((resolve, reject) => {
            const timer = setInterval(async () => {
                try {
                    const searchResult = await this.cinerinoService.ownerShipInfo.search({
                        typeOfGood: {
                            typeOf: factory.chevre.programMembership.ProgramMembershipType.ProgramMembership
                        }
                    });
                    const now = (await this.utilService.getServerTime()).date;
                    const programMembershipOwnershipInfos =
                        searchResult.data.filter(p => moment(p.ownedThrough).unix() > moment(now).unix());
                    if (programMembershipOwnershipInfos.length > 0) {
                        clearInterval(timer);
                        resolve(true);
                    } else if (count > limit) {
                        clearInterval(timer);
                        resolve(false);
                    }
                    count++;
                } catch (err) {
                    reject(err);
                }
            }, time);
        });
    }

    /**
     * 退会
     * @method unRegister
     */
    public async unRegister(args: {
        ownershipInfoIdentifier: string;
    }) {
        await this.cinerinoService.getServices();
        await this.cinerinoService.person.unRegisterProgramMembership({
            id: 'me',
            ownershipInfoIdentifier: args.ownershipInfoIdentifier
        });
    }

}

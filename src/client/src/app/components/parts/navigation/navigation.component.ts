/**
 * NavigationComponent
 */
import { Component, OnInit } from '@angular/core';
import { SasakiService } from '../../../services/sasaki/sasaki.service';

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.scss']
})
/**
 * ナビゲーション
 * @class NavigationComponent
 * @implements OnInit
 */
export class NavigationComponent implements OnInit {

    constructor(
        public sasaki: SasakiService
    ) { }

    /**
     * 初期化
     * @method ngOnInit
     * @returns {Promise<void>}
     */
    public ngOnInit(): void { }

}

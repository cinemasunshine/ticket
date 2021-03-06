/**
 * HeaderComponent
 */
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../../services';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
/**
 * ヘッダー
 * @class HeaderComponent
 * @implements OnInit
 */
export class HeaderComponent implements OnInit {

    public isMenuOpen: boolean;

    constructor(
        public userService: UserService
    ) { }

    /**
     * 初期化
     * @method ngOnInit
     */
    public ngOnInit() {
        this.isMenuOpen = false;
    }

    /**
     * メニューを開く
     * @method menuOpen
     */
    public menuOpen() {
        this.isMenuOpen = true;
    }

    /**
     * メニューを閉じる
     * @method menuClose
     */
    public menuClose() {
        this.isMenuOpen = false;
    }
}

/**
 * LoginComponentテスト
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingComponent } from '../../components/loading/loading.component';
import { SasakiService, SasakiStubService } from '../../service/sasaki/sasaki-stub.service';
import { Router, RouterStub } from '../../testing/router-stubs';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {

    it('コンポーネント生成', async () => {
        await TestBed.configureTestingModule({
            declarations: [
                LoginComponent,
                LoadingComponent
            ],
            providers: [
                { provide: SasakiService, useClass: SasakiStubService },
                { provide: Router, useClass: RouterStub }
            ]
        })
            .compileComponents();
        const fixture = TestBed.createComponent(LoginComponent);
        const component = fixture.componentInstance;
        fixture.detectChanges();

        await expect(component).toBeTruthy();
    });

    it('login 正常', async () => {
        const routerStub = new RouterStub();
        spyOn(routerStub, 'navigate');
        await TestBed.configureTestingModule({
            declarations: [
                LoginComponent,
                LoadingComponent
            ],
            providers: [
                { provide: SasakiService, useClass: SasakiStubService },
                { provide: Router, useValue: routerStub }
            ]
        })
            .compileComponents();
        const fixture = TestBed.createComponent(LoginComponent);
        const component = fixture.componentInstance;
        fixture.detectChanges();

        await component.login();
        await expect(routerStub.navigate).toHaveBeenCalled();
    });

    it('login エラー', async () => {
        const sasakiStubService = new SasakiStubService();
        spyOn(sasakiStubService.auth, 'signIn').and.throwError('signInエラー');
        await TestBed.configureTestingModule({
            declarations: [
                LoginComponent,
                LoadingComponent
            ],
            providers: [
                { provide: SasakiService, useValue: sasakiStubService },
                { provide: Router, useClass: RouterStub }
            ]
        })
            .compileComponents();
        const fixture = TestBed.createComponent(LoginComponent);
        const component = fixture.componentInstance;
        fixture.detectChanges();
        await component.login();
        await expect(component.isLoading).toBeFalsy();
    });
});

/**
 * ルーティング
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AboutComponent } from './components/about/about.component';
import { AuthLoginComponent } from './components/auth-login/auth-login.component';
import { LawComponent } from './components/law/law.component';
import { MainComponent } from './components/main/main.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PolicyComponent } from './components/policy/policy.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PurchaseComponent } from './components/purchase/purchase.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignOutComponent } from './components/sign-out/sign-out.component';
import { StartupComponent } from './components/startup/startup.component';
import { TicketHolderComponent } from './components/ticket-holder/ticket-holder.component';
import { AuthGuardService } from './service/auth-guard/auth-guard.service';

const appRoutes: Routes = [
  { path: '', redirectTo: '/ticket-holder', pathMatch: 'full' },
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: 'ticket-holder', component: TicketHolderComponent },
      { path: 'purchase', component: PurchaseComponent },
      { path: 'about', component: AboutComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'policy', component: PolicyComponent },
      { path: 'law', component: LawComponent },
      { path: 'privacy', component: PrivacyComponent }
    ]
  },
  {
    path: 'auth',
    children: [
      { path: 'login', component: AuthLoginComponent }
    ]
  },
  { path: 'startup', component: StartupComponent },
  { path: 'signIn', component: SignInComponent },
  { path: 'signOut', component: SignOutComponent },
  { path: '**', component: NotFoundComponent }
];

// tslint:disable-next-line:no-stateless-class
@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { useHash: true, enableTracing: true } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }

/**
 * NoTicketComponentテスト
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoTicketComponent } from './no-ticket.component';

describe('NoTicketComponent', () => {
  let component: NoTicketComponent;
  let fixture: ComponentFixture<NoTicketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoTicketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

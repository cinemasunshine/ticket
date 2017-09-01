/**
 * TimeScheduleComponentテスト
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeScheduleComponent } from './time-schedule.component';

describe('TimeScheduleComponent', () => {
  let component: TimeScheduleComponent;
  let fixture: ComponentFixture<TimeScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

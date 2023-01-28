import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyForecastsComponent } from './my-forecasts.component';

describe('MyForecastsComponent', () => {
  let component: MyForecastsComponent;
  let fixture: ComponentFixture<MyForecastsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyForecastsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyForecastsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

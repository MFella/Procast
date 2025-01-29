import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadDataComponent } from './load-data.component';

describe('LoadDataComponent', () => {
  let component: LoadDataComponent;
  let fixture: ComponentFixture<LoadDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

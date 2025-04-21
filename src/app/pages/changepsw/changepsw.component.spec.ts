import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangepswComponent } from './changepsw.component';

describe('ChangepswComponent', () => {
  let component: ChangepswComponent;
  let fixture: ComponentFixture<ChangepswComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangepswComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangepswComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

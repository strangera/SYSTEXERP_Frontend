import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSBR00CRUComponent } from './sysbr00.cru.component';

describe('SYSBR00CRUComponent', () => {
  let component: SYSBR00CRUComponent;
  let fixture: ComponentFixture<SYSBR00CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSBR00CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSBR00CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

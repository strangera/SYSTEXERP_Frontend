import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSBP00CRUComponent } from './sysbp00.cru.component';

describe('SYSBP00CRUComponent', () => {
  let component: SYSBP00CRUComponent;
  let fixture: ComponentFixture<SYSBP00CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSBP00CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSBP00CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

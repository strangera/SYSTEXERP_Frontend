import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSBR10CRUComponent } from './SYSBR10.cru.component';

describe('SYSBR10CRUComponent', () => {
  let component: SYSBR10CRUComponent;
  let fixture: ComponentFixture<SYSBR10CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSBR10CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSBR10CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

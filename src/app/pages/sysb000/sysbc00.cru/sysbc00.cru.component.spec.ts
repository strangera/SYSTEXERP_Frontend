import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSBC00CRUComponent } from './sysbc00.cru.component';

describe('SYSBC00CRUComponent', () => {
  let component: SYSBC00CRUComponent;
  let fixture: ComponentFixture<SYSBC00CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSBC00CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSBC00CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

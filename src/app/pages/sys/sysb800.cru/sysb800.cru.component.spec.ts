import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB800CRUComponent } from './sysb800.cru.component';

describe('SYSB800CRUComponent', () => {
  let component: SYSB800CRUComponent;
  let fixture: ComponentFixture<SYSB800CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB800CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB800CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

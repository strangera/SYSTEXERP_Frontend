import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYSB900CRUComponent } from './sysb900.cru.component';

describe('SYSB900CRUComponent', () => {
  let component: SYSB900CRUComponent;
  let fixture: ComponentFixture<SYSB900CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSB900CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYSB900CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

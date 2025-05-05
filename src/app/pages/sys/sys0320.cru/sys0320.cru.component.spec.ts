import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0320CRUComponent } from './sys0320.cru.component';

describe('SYS0320CRUComponent', () => {
  let component: SYS0320CRUComponent;
  let fixture: ComponentFixture<SYS0320CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0320CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0320CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

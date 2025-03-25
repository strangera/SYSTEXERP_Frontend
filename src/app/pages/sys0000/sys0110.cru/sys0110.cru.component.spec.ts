import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0110CRUComponent } from './sys0110.cru.component';

describe('SYS0110CRUComponent', () => {
  let component: SYS0110CRUComponent;
  let fixture: ComponentFixture<SYS0110CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0110CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0110CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

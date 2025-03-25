import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0220CRUComponent } from './sys0220.cru.component';

describe('SYS0220CRUComponent', () => {
  let component: SYS0220CRUComponent;
  let fixture: ComponentFixture<SYS0220CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0220CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0220CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

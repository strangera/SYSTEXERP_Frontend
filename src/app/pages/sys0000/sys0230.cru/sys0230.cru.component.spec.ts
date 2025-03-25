import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SYS0230CRUComponent } from './sys0230.cru.component';

describe('SYS0230CRUComponent', () => {
  let component: SYS0230CRUComponent;
  let fixture: ComponentFixture<SYS0230CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYS0230CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SYS0230CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

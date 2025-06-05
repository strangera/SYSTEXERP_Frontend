import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2B010CRUComponent } from './tls2b010-cru.component';

describe('TLS2B010CRUComponent', () => {
  let component: TLS2B010CRUComponent;
  let fixture: ComponentFixture<TLS2B010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2B010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2B010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

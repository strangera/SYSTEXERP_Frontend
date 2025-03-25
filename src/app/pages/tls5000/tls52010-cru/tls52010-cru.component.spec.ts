import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52010CRUComponent } from './tls52010-cru.component';

describe('TLS52010CRUComponent', () => {
  let component: TLS52010CRUComponent;
  let fixture: ComponentFixture<TLS52010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

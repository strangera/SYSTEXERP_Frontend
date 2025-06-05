import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52050CRUComponent } from './tls52050-cru.component';

describe('TLS52050CRUComponent', () => {
  let component: TLS52050CRUComponent;
  let fixture: ComponentFixture<TLS52050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

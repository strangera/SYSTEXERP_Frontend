import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS45010CRUComponent } from './tls45010-cru.component';

describe('TLS45010CRUComponent', () => {
  let component: TLS45010CRUComponent;
  let fixture: ComponentFixture<TLS45010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS45010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS45010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

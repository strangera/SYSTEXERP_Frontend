import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52070CRUComponent } from './tls52070-cru.component';

describe('TLS52070CRUComponent', () => {
  let component: TLS52070CRUComponent;
  let fixture: ComponentFixture<TLS52070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS14010CRUComponent } from './tls14010-cru.component';

describe('TLS14010CRUComponent', () => {
  let component: TLS14010CRUComponent;
  let fixture: ComponentFixture<TLS14010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS14010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS14010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

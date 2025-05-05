import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2A010CRUComponent } from './tls2a010-cru.component';

describe('TLS2A010CRUComponent', () => {
  let component: TLS2A010CRUComponent;
  let fixture: ComponentFixture<TLS2A010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2A010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2A010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52040CRUComponent } from './tls52040-cru.component';

describe('TLS52040CRUComponent', () => {
  let component: TLS52040CRUComponent;
  let fixture: ComponentFixture<TLS52040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

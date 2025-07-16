import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23130CRUComponent } from './tls23130-cru.component';

describe('Tls23130CruComponent', () => {
  let component: TLS23130CRUComponent;
  let fixture: ComponentFixture<TLS23130CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23130CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23130CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

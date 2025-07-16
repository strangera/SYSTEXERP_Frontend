import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23050CRUComponent } from './tls23050-cru.component';

describe('Tls23050CruComponent', () => {
  let component: TLS23050CRUComponent;
  let fixture: ComponentFixture<TLS23050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

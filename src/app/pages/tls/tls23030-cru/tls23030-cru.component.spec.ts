import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23030CRUComponent } from './tls23030-cru.component';

describe('Tls23030CruComponent', () => {
  let component: TLS23030CRUComponent;
  let fixture: ComponentFixture<TLS23030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

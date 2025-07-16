import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23100CRUComponent } from './tls23100-cru.component';

describe('Tls23100CruComponent', () => {
  let component: TLS23100CRUComponent;
  let fixture: ComponentFixture<TLS23100CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23100CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23100CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

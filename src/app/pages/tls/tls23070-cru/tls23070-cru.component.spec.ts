import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23070CRUComponent } from './tls23070-cru.component';

describe('Tls23070CruComponent', () => {
  let component: TLS23070CRUComponent;
  let fixture: ComponentFixture<TLS23070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

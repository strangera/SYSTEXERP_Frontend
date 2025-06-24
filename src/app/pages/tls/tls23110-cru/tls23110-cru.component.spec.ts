import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23110CruComponent } from './tls23110-cru.component';

describe('Tls23110CruComponent', () => {
  let component: Tls23110CruComponent;
  let fixture: ComponentFixture<Tls23110CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23110CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23110CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

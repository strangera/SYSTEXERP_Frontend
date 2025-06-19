import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23070CruComponent } from './tls23070-cru.component';

describe('Tls23070CruComponent', () => {
  let component: Tls23070CruComponent;
  let fixture: ComponentFixture<Tls23070CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23070CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23070CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

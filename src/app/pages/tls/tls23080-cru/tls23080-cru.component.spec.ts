import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23080CruComponent } from './tls23080-cru.component';

describe('Tls23080CruComponent', () => {
  let component: Tls23080CruComponent;
  let fixture: ComponentFixture<Tls23080CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23080CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23080CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

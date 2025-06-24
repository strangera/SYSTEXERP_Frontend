import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23120CruComponent } from './tls23120-cru.component';

describe('Tls23120CruComponent', () => {
  let component: Tls23120CruComponent;
  let fixture: ComponentFixture<Tls23120CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23120CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23120CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

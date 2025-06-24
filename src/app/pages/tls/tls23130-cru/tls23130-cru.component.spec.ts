import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23130CruComponent } from './tls23130-cru.component';

describe('Tls23130CruComponent', () => {
  let component: Tls23130CruComponent;
  let fixture: ComponentFixture<Tls23130CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23130CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23130CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

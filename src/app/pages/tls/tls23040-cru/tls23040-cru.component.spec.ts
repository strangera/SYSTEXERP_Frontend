import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23040CruComponent } from './tls23040-cru.component';

describe('Tls23040CruComponent', () => {
  let component: Tls23040CruComponent;
  let fixture: ComponentFixture<Tls23040CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23040CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23040CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

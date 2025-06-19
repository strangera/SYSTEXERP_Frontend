import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23090CruComponent } from './tls23090-cru.component';

describe('Tls23090CruComponent', () => {
  let component: Tls23090CruComponent;
  let fixture: ComponentFixture<Tls23090CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23090CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23090CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

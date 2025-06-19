import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23100CruComponent } from './tls23100-cru.component';

describe('Tls23100CruComponent', () => {
  let component: Tls23100CruComponent;
  let fixture: ComponentFixture<Tls23100CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23100CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23100CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

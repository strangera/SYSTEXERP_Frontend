import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23050CruComponent } from './tls23050-cru.component';

describe('Tls23050CruComponent', () => {
  let component: Tls23050CruComponent;
  let fixture: ComponentFixture<Tls23050CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23050CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23050CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

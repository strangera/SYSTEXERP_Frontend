import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23140CruComponent } from './tls23140-cru.component';

describe('Tls23140CruComponent', () => {
  let component: Tls23140CruComponent;
  let fixture: ComponentFixture<Tls23140CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23140CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23140CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

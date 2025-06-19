import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23060CruComponent } from './tls23060-cru.component';

describe('Tls23060CruComponent', () => {
  let component: Tls23060CruComponent;
  let fixture: ComponentFixture<Tls23060CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23060CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23060CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls23030CruComponent } from './tls23030-cru.component';

describe('Tls23030CruComponent', () => {
  let component: Tls23030CruComponent;
  let fixture: ComponentFixture<Tls23030CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls23030CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls23030CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

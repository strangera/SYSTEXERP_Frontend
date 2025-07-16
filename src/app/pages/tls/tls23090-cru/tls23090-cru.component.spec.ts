import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23090CRUComponent } from './tls23090-cru.component';

describe('Tls23090CruComponent', () => {
  let component: TLS23090CRUComponent;
  let fixture: ComponentFixture<TLS23090CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23090CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23090CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23010CRUComponent } from './tls23010-cru.component';

describe('TLS23010CRUComponent', () => {
  let component: TLS23010CRUComponent;
  let fixture: ComponentFixture<TLS23010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

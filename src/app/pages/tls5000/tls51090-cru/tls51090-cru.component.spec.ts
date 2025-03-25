import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51090CRUComponent } from './tls51090-cru.component';

describe('TLS51090CRUComponent', () => {
  let component: TLS51090CRUComponent;
  let fixture: ComponentFixture<TLS51090CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51090CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51090CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS53040CRUComponent } from './tls53040-cru.component';

describe('TLS53040CRUComponent', () => {
  let component: TLS53040CRUComponent;
  let fixture: ComponentFixture<TLS53040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS53040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS53040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

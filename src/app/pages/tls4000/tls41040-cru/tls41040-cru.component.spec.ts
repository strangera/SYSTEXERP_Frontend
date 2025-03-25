import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS41040CRUComponent } from './tls41040-cru.component';

describe('TLS41040CRUComponent', () => {
  let component: TLS41040CRUComponent;
  let fixture: ComponentFixture<TLS41040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS41040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS41040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

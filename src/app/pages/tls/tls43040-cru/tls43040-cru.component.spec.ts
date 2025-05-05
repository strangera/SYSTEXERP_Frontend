import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS43040CRUComponent } from './tls43040-cru.component';

describe('TLS43040CRUComponent', () => {
  let component: TLS43040CRUComponent;
  let fixture: ComponentFixture<TLS43040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS43040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS43040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

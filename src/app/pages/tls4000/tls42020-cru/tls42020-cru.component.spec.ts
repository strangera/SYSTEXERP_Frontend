import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS42020CRUComponent } from './tls42020-cru.component';

describe('TLS42020CRUComponent', () => {
  let component: TLS42020CRUComponent;
  let fixture: ComponentFixture<TLS42020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS42020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS42020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS42010CRUComponent } from './tls42010-cru.component';

describe('TLS42010CRUComponent', () => {
  let component: TLS42010CRUComponent;
  let fixture: ComponentFixture<TLS42010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS42010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS42010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

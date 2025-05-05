import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS41060CRUComponent } from './tls41060-cru.component';

describe('TLS41060CRUComponent', () => {
  let component: TLS41060CRUComponent;
  let fixture: ComponentFixture<TLS41060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS41060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS41060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

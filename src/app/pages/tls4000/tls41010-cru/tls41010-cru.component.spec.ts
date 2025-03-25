import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS41010CRUComponent } from './tls41010-cru.component';

describe('TLS41010CRUComponent', () => {
  let component: TLS41010CRUComponent;
  let fixture: ComponentFixture<TLS41010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS41010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS41010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

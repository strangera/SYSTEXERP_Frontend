import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS41050CRUComponent } from './tls41050-cru.component';

describe('TLS41050CRUComponent', () => {
  let component: TLS41050CRUComponent;
  let fixture: ComponentFixture<TLS41050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS41050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS41050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

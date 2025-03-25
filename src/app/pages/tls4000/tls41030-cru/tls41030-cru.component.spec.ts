import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS41030CRUComponent } from './tls41030-cru.component';

describe('TLS41030CRUComponent', () => {
  let component: TLS41030CRUComponent;
  let fixture: ComponentFixture<TLS41030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS41030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS41030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

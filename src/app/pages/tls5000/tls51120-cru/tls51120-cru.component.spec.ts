import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51120CRUComponent } from './tls51120-cru.component';

describe('TLS51120CRUComponent', () => {
  let component: TLS51120CRUComponent;
  let fixture: ComponentFixture<TLS51120CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51120CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51120CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

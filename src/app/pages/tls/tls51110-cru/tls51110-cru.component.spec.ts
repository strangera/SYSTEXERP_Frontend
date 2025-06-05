import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51110CRUComponent } from './tls51110-cru.component';

describe('TLS51110CRUComponent', () => {
  let component: TLS51110CRUComponent;
  let fixture: ComponentFixture<TLS51110CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51110CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51110CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51030CRUComponent } from './tls51030-cru.component';

describe('TLS51030CRUComponent', () => {
  let component: TLS51030CRUComponent;
  let fixture: ComponentFixture<TLS51030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS22010CRUComponent } from './tls22010-cru.component';

describe('TLS22010CRUComponent', () => {
  let component: TLS22010CRUComponent;
  let fixture: ComponentFixture<TLS22010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS22010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS22010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

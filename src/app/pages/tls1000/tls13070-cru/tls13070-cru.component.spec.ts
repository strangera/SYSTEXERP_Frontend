import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13070CRUComponent } from './tls13070-cru.component';

describe('TLS13070CRUComponent', () => {
  let component: TLS13070CRUComponent;
  let fixture: ComponentFixture<TLS13070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

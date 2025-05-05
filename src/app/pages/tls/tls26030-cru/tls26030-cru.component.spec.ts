import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26030CRUComponent } from './tls26030-cru.component';

describe('TLS26030CRUComponent', () => {
  let component: TLS26030CRUComponent;
  let fixture: ComponentFixture<TLS26030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS26030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

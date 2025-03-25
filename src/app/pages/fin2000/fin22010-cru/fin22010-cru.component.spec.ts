import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN22010CRUComponent } from './fin22010-cru.component';

describe('FIN22010CRUComponent', () => {
  let component: FIN22010CRUComponent;
  let fixture: ComponentFixture<FIN22010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN22010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN22010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

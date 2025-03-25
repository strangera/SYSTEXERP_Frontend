import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN12010CRUComponent } from './fin12010-cru.component';

describe('FIN12010CRUComponent', () => {
  let component: FIN12010CRUComponent;
  let fixture: ComponentFixture<FIN12010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN12010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN12010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

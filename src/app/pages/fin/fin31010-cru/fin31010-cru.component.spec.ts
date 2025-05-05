import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN31010CRUComponent } from './fin31010-cru.component';

describe('FIN31010CRUComponent', () => {
  let component: FIN31010CRUComponent;
  let fixture: ComponentFixture<FIN31010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN31010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN31010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

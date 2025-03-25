import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN25010CRUComponent } from './fin25010-cru.component';

describe('FIN25010CRUComponent', () => {
  let component: FIN25010CRUComponent;
  let fixture: ComponentFixture<FIN25010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN25010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN25010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN61010CRUComponent } from './fin61010-cru.component';

describe('FIN61010CRUComponent', () => {
  let component: FIN61010CRUComponent;
  let fixture: ComponentFixture<FIN61010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN61010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN61010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

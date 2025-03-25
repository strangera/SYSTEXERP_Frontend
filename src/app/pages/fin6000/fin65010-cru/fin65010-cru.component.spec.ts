import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN65010CRUComponent } from './fin65010-cru.component';

describe('FIN65010CRUComponent', () => {
  let component: FIN65010CRUComponent;
  let fixture: ComponentFixture<FIN65010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN65010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN65010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

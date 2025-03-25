import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN53010CRUComponent } from './fin53010-cru.component';

describe('FIN53010CRUComponent', () => {
  let component: FIN53010CRUComponent;
  let fixture: ComponentFixture<FIN53010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN53010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN53010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

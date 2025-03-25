import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35010CRUComponent } from './fin35010-cru.component';

describe('FIN35010CRUComponent', () => {
  let component: FIN35010CRUComponent;
  let fixture: ComponentFixture<FIN35010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

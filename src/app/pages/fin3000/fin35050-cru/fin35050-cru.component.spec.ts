import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35050CRUComponent } from './fin35050-cru.component';

describe('FIN35050CRUComponent', () => {
  let component: FIN35050CRUComponent;
  let fixture: ComponentFixture<FIN35050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

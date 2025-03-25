import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN62050CRUComponent } from './fin62050-cru.component';

describe('FIN62050CRUComponent', () => {
  let component: FIN62050CRUComponent;
  let fixture: ComponentFixture<FIN62050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN62050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN62050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

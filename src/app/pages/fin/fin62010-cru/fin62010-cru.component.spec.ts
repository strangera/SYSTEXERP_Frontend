import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN62010CRUComponent } from './fin62010-cru.component';

describe('FIN62010CRUComponent', () => {
  let component: FIN62010CRUComponent;
  let fixture: ComponentFixture<FIN62010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN62010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN62010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

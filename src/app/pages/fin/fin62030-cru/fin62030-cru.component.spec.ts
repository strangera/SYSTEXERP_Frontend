import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN62030CRUComponent } from './fin62030-cru.component';

describe('FIN62030CRUComponent', () => {
  let component: FIN62030CRUComponent;
  let fixture: ComponentFixture<FIN62030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN62030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN62030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

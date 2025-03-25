import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN62020CRUComponent } from './fin62020-cru.component';

describe('FIN62020CRUComponent', () => {
  let component: FIN62020CRUComponent;
  let fixture: ComponentFixture<FIN62020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN62020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN62020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

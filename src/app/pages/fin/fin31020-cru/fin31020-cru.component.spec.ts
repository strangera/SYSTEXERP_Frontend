import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN31020CRUComponent } from './fin31020-cru.component';

describe('FIN31020CRUComponent', () => {
  let component: FIN31020CRUComponent;
  let fixture: ComponentFixture<FIN31020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN31020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN31020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

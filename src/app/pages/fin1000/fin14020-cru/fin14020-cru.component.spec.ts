import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14020CRUComponent } from './fin14020-cru.component';

describe('FIN14020CRUComponent', () => {
  let component: FIN14020CRUComponent;
  let fixture: ComponentFixture<FIN14020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

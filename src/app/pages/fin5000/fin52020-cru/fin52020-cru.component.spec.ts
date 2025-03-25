import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52020CRUComponent } from './fin52020-cru.component';

describe('FIN52020CRUComponent', () => {
  let component: FIN52020CRUComponent;
  let fixture: ComponentFixture<FIN52020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

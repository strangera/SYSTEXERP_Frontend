import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11020CRUComponent } from './fin11020-cru.component';

describe('FIN11020CRUComponent', () => {
  let component: FIN11020CRUComponent;
  let fixture: ComponentFixture<FIN11020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

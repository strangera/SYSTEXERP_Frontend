import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN32020CRUComponent } from './fin32020-cru.component';

describe('FIN32020CRUComponent', () => {
  let component: FIN32020CRUComponent;
  let fixture: ComponentFixture<FIN32020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN32020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN32020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

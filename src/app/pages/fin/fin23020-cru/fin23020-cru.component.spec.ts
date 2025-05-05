import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23020CRUComponent } from './fin23020-cru.component';

describe('FIN23020CRUComponent', () => {
  let component: FIN23020CRUComponent;
  let fixture: ComponentFixture<FIN23020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

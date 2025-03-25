import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN22020CRUComponent } from './fin22020-cru.component';

describe('FIN22020CRUComponent', () => {
  let component: FIN22020CRUComponent;
  let fixture: ComponentFixture<FIN22020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN22020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN22020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

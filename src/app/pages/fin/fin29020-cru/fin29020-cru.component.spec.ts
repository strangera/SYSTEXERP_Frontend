import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29020CRUComponent } from './fin29020-cru.component';

describe('FIN29020CRUComponent', () => {
  let component: FIN29020CRUComponent;
  let fixture: ComponentFixture<FIN29020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

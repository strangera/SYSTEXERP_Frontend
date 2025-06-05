import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14080CRUComponent } from './fin14080-cru.component';

describe('FIN14080CRUComponent', () => {
  let component: FIN14080CRUComponent;
  let fixture: ComponentFixture<FIN14080CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14080CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14080CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

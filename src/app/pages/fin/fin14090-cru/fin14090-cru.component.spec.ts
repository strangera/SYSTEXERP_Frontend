import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14090CRUComponent } from './fin14090-cru.component';

describe('FIN14090CRUComponent', () => {
  let component: FIN14090CRUComponent;
  let fixture: ComponentFixture<FIN14090CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14090CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14090CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

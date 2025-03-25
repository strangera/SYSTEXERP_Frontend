import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29090CRUComponent } from './fin29090-cru.component';

describe('FIN29090CRUComponent', () => {
  let component: FIN29090CRUComponent;
  let fixture: ComponentFixture<FIN29090CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29090CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29090CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

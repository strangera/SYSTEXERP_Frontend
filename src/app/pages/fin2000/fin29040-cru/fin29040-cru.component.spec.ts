import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29040CRUComponent } from './fin29040-cru.component';

describe('FIN29040CRUComponent', () => {
  let component: FIN29040CRUComponent;
  let fixture: ComponentFixture<FIN29040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

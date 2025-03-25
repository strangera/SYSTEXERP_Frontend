import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN15040CRUComponent } from './fin15040-cru.component';

describe('FIN15040CRUComponent', () => {
  let component: FIN15040CRUComponent;
  let fixture: ComponentFixture<FIN15040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN15040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN15040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

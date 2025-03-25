import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52040CRUComponent } from './fin52040-cru.component';

describe('FIN52040CRUComponent', () => {
  let component: FIN52040CRUComponent;
  let fixture: ComponentFixture<FIN52040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

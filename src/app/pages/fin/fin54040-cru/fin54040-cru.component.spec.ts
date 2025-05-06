import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54040CRUComponent } from './fin54040-cru.component';

describe('FIN54040CRUComponent', () => {
  let component: FIN54040CRUComponent;
  let fixture: ComponentFixture<FIN54040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

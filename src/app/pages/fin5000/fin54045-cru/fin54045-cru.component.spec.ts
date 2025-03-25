import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54045CRUComponent } from './fin54045-cru.component';

describe('FIN54045CRUComponent', () => {
  let component: FIN54045CRUComponent;
  let fixture: ComponentFixture<FIN54045CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54045CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54045CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

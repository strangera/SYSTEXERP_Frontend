import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54015CRUComponent } from './fin54015-cru.component';

describe('FIN54015CRUComponent', () => {
  let component: FIN54015CRUComponent;
  let fixture: ComponentFixture<FIN54015CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54015CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54015CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

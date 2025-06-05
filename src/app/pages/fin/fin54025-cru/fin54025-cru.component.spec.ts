import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54025CRUComponent } from './fin54025-cru.component';

describe('FIN54025CRUComponent', () => {
  let component: FIN54025CRUComponent;
  let fixture: ComponentFixture<FIN54025CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54025CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54025CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

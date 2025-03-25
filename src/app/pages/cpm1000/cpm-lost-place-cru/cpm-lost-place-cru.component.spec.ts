import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpmLostPlaceCRUComponent } from './cpm-lost-place-cru.component';

describe('CpmLostPlaceCRUComponent', () => {
  let component: CpmLostPlaceCRUComponent;
  let fixture: ComponentFixture<CpmLostPlaceCRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CpmLostPlaceCRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CpmLostPlaceCRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

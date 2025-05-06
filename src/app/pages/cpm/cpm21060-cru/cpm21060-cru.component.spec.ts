import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CPM21060CRUComponent } from './cpm21060-cru.component';

describe('CPM21060CRUComponent', () => {
  let component: CPM21060CRUComponent;
  let fixture: ComponentFixture<CPM21060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CPM21060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CPM21060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDropdownNestComponent } from './tree-dropdown-nest.component';

describe('TreeDropdownNestComponent', () => {
  let component: TreeDropdownNestComponent;
  let fixture: ComponentFixture<TreeDropdownNestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeDropdownNestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeDropdownNestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownMultlabelComponent } from './dropdown-multlabel.component';

describe('DropdownMultlabelComponent', () => {
  let component: DropdownMultlabelComponent;
  let fixture: ComponentFixture<DropdownMultlabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownMultlabelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownMultlabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

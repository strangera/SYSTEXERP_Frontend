import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorPanelComponent } from './selector-panel.component';

describe('SelectorPanelComponent', () => {
  let component: SelectorPanelComponent;
  let fixture: ComponentFixture<SelectorPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

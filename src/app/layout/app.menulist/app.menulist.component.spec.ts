import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppMenulistComponent } from './app.menulist.component';

describe('AppMenulistComponent', () => {
  let component: AppMenulistComponent;
  let fixture: ComponentFixture<AppMenulistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppMenulistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppMenulistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

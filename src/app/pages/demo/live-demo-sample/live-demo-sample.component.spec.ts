import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveDemoSampleComponent } from './live-demo-sample.component';

describe('LiveDemoSampleComponent', () => {
  let component: LiveDemoSampleComponent;
  let fixture: ComponentFixture<LiveDemoSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveDemoSampleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveDemoSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29110Component } from './fin29110.component';

describe('FIN29110Component', () => {
  let component: FIN29110Component;
  let fixture: ComponentFixture<FIN29110Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29110Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29110Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54045Component } from './fin54045.component';

describe('FIN54045Component', () => {
  let component: FIN54045Component;
  let fixture: ComponentFixture<FIN54045Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54045Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54045Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

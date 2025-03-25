import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54030Component } from './fin54030.component';

describe('FIN54030Component', () => {
  let component: FIN54030Component;
  let fixture: ComponentFixture<FIN54030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

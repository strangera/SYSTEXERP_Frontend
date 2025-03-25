import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54015Component } from './fin54015.component';

describe('FIN54015Component', () => {
  let component: FIN54015Component;
  let fixture: ComponentFixture<FIN54015Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54015Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54015Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

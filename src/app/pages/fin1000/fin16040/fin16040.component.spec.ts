import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN16040Component } from './fin16040.component';

describe('FIN16040Component', () => {
  let component: FIN16040Component;
  let fixture: ComponentFixture<FIN16040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN16040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN16040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

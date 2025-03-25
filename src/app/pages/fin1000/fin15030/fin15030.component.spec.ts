import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN15030Component } from './fin15030.component';

describe('FIN15030Component', () => {
  let component: FIN15030Component;
  let fixture: ComponentFixture<FIN15030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN15030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN15030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

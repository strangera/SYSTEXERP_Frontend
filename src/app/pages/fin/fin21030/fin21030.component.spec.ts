import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN21030Component } from './fin21030.component';

describe('FIN21030Component', () => {
  let component: FIN21030Component;
  let fixture: ComponentFixture<FIN21030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN21030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN21030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

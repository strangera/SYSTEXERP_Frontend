import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN13030Component } from './fin13030.component';

describe('FIN13030Component', () => {
  let component: FIN13030Component;
  let fixture: ComponentFixture<FIN13030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN13030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN13030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

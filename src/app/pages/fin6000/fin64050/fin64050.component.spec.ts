import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN64050Component } from './fin64050.component';

describe('FIN64050Component', () => {
  let component: FIN64050Component;
  let fixture: ComponentFixture<FIN64050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN64050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN64050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

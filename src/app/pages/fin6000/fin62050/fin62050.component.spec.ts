import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN62050Component } from './fin62050.component';

describe('FIN62050Component', () => {
  let component: FIN62050Component;
  let fixture: ComponentFixture<FIN62050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN62050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN62050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

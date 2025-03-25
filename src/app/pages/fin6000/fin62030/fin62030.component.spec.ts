import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN62030Component } from './fin62030.component';

describe('FIN62030Component', () => {
  let component: FIN62030Component;
  let fixture: ComponentFixture<FIN62030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN62030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN62030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

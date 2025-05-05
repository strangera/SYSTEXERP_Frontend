import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN62010Component } from './fin62010.component';

describe('FIN62010Component', () => {
  let component: FIN62010Component;
  let fixture: ComponentFixture<FIN62010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN62010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN62010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

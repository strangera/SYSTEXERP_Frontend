import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN62020Component } from './fin62020.component';

describe('FIN62020Component', () => {
  let component: FIN62020Component;
  let fixture: ComponentFixture<FIN62020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN62020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN62020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

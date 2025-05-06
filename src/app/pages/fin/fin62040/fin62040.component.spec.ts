import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN62040Component } from './fin62040.component';

describe('FIN62040Component', () => {
  let component: FIN62040Component;
  let fixture: ComponentFixture<FIN62040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN62040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN62040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

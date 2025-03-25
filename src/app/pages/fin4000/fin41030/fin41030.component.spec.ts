import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN41030Component } from './fin41030.component';

describe('FIN41030Component', () => {
  let component: FIN41030Component;
  let fixture: ComponentFixture<FIN41030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN41030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN41030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

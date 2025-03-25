import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11030Component } from './fin11030.component';

describe('FIN11030Component', () => {
  let component: FIN11030Component;
  let fixture: ComponentFixture<FIN11030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

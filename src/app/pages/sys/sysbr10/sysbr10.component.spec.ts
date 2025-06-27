import { SYSBR10Component } from './sysbr10.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('SYSBR10Component', () => {
  let component: SYSBR10Component;
  let fixture: ComponentFixture<SYSBR10Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SYSBR10Component]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SYSBR10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

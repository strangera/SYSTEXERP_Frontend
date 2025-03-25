import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicQpageComponent } from './basic-qpage.component';

describe('BasicQpageComponent', () => {
  let component: BasicQpageComponent;
  let fixture: ComponentFixture<BasicQpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicQpageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicQpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

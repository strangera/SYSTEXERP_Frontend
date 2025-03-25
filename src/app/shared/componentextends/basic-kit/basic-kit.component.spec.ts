import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BasicKitComponent } from './basic-kit.component';

describe('BasicKitComponent', () => {
  let component: BasicKitComponent;
  let fixture: ComponentFixture<BasicKitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicKitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicKitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

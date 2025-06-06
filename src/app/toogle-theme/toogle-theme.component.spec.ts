import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleThemeComponent } from './toogle-theme.component';
describe('ToogleThemeComponent', () => {
  let component: ToggleThemeComponent;
  let fixture: ComponentFixture<ToggleThemeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleThemeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToggleThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

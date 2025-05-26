import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TvShowsPageComponent } from './tv-shows-page.component';

describe('TvShowsPageComponent', () => {
  let component: TvShowsPageComponent;
  let fixture: ComponentFixture<TvShowsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TvShowsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TvShowsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

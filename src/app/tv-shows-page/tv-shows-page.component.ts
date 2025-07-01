import { Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ToggleThemeService } from '../toggle-theme.service';
import { GeminiService } from '../gemini.service';
import { TmdbService } from '../services/tmdb.service';
import { UserService } from '../user.service';
import { AfterViewInit } from '@angular/core';

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
@Component({
  selector: 'app-tv-shows-page',
  templateUrl: './tv-shows-page.component.html',
  styleUrl: './tv-shows-page.component.css',
  animations: [
    trigger('slideInOutMobile', [
      state(
        'in',
        style({
          transform: 'translateX(0)',
          opacity: 1,
        })
      ),
      state(
        'out',
        style({
          transform: 'translateX(100%)',
          opacity: 0,
        })
      ),
      transition('in <=> out', animate('200ms ease-in-out')),
    ]),
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(-34%)', opacity: 1 })),
      state('out', style({ transform: 'translateX(100%)', opacity: 0 })),
      transition('in => out', [animate('300ms ease-in-out')]),
      transition('out => in', [animate('300ms ease-in-out')]),
    ]),
    trigger('flipIcon', [
      state('default', style({ transform: 'rotateX(0deg)' })),
      state('flipped', style({ transform: 'rotateX(180deg)' })),
      transition('default <=> flipped', animate('300ms ease')),
    ]),
    trigger('carouselPush', [
      state('false', style({ transform: 'translateX(0)' })),
      state(
        'true',
        style({ transform: 'translateX(-0px)', width: 'calc(100% - 330px)' })
      ),
      transition('false <=> true', animate('300ms ease-in-out')),
    ]),
  ],
})
export class TvShowsPageComponent implements OnInit {
  searchQuery = '';
  shows: any[] = [];
  noResultsFound = false;
  loading = false;
  topRated: any[] = [];
  action: any[] = [];
  comedy: any[] = [];
  recommendedShows: any[] = [];
  selectedShow: any = null;
  selectedShowGenres: any[] = [];
  loadingRecommended = false;
  recommendedLoading: boolean = true;
  displayTrailerDialog = false;
  trailerKey: string | null = null;
  userId: number | null = null;
  user: any = null;
  panelCountdown = false;
  isFiltered = false;
  birthDate: Date = new Date();
  numberOfItems = 0;

  constructor(
    private tmdbService: TmdbService,
    private router: Router,
    private messageService: MessageService,
    private userService: UserService,
    private route: ActivatedRoute,
    private geminiService: GeminiService
  ) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      this.user = JSON.parse(userString);
      this.birthDate = new Date(this.user.birthdate);

      // 2) Immediately calculate age and set global isAdult
      const age = this.calculateAge(this.birthDate);
      this.userService.setIsAdult(age >= 18);
    }
    this.recommendedShows = new Array(5).fill(null);
    this.action = new Array(5).fill(null);
    this.comedy = new Array(5).fill(null);
    this.topRated = new Array(5).fill(null);
    this.fetchCategories();
    this.fetchGenres();
    this.isMobileView = window.innerWidth <= 760;
  }

  fetchCategories() {
    const loggedInUserId = localStorage.getItem('userId');
    if (loggedInUserId) {
      this.userId = +loggedInUserId;
      this.loadRecommendedContent(+loggedInUserId);
    }

    this.tmdbService
      .getTopRatedTvShows()
      .subscribe((res) => (this.topRated = res.results.slice(0, 10)));
    this.tmdbService
      .getTvShowsByGenre(10759)
      .subscribe((res) => (this.action = res.results.slice(0, 10)));
    this.tmdbService.getTvShowsByGenre(35).subscribe((res) => {
      this.comedy = res.results.slice(0, 10);
    });
  }
  showAgeModal = false;
  hidePanel = true;
  openAgeModal() {
    this.showAgeModal = true;
  }

  closeAgeModal() {
    this.showAgeModal = false;
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
  loadRecommendedContent(userId: number): void {
    this.recommendedLoading = true;

    this.userService.getUserById(userId).subscribe((user) => {
      if (!user) return;

      const prompt = this.buildRecommendationPrompt(user);
      this.geminiService
        .sendMessage([{ role: 'user', parts: [{ text: prompt }] }])
        .subscribe((res: any) => {
          console.log('Gemini TV response: ', res);
          const reply = res.candidates[0]?.content?.parts[0]?.text || '';
          const aiTitles = reply
            .split(',')
            .map((title: string) => title.trim())
            .filter((t: string) => t);

          if (aiTitles.length === 0) {
            this.noResultsFound = true;
            return;
          }

          const titleRequests = aiTitles.map((title: string) =>
            this.tmdbService.getTvByTitle(title)
          );

          forkJoin(titleRequests).subscribe((responses: any) => {
            console.log('TV show responses: ', responses);
            const aiRecommended = responses
              .map((res: any) => res.results[0])
              .filter((item: any) => item && item.poster_path)
              .map((item: any) => ({ ...item, media_type: 'tv' }));

            this.recommendedShows = aiRecommended.slice(0, 10);
            this.noResultsFound = this.recommendedShows.length === 0;
          });
        });
    });
  }

  private buildRecommendationPrompt(user: any): string {
    const genres = [
      ...new Set(user.watchedTvShows.flatMap((s: any) => s.genres)),
    ];
    const years = user.watchedTvShows.map((s: any) => s.releaseYear);
    const languages = [
      ...new Set(user.watchedTvShows.map((s: any) => s.language)),
    ];
    const mainCharacters = [
      ...new Set(
        user.watchedTvShows.flatMap((s: any) =>
          s.mainCharacters.map((c: any) => c.name)
        )
      ),
    ];

    const avgYear = Math.round(
      years.reduce((a: number, b: number) => a + b, 0) / years.length
    );

    const showsWatched = user.watchedTvShows.map(
      (s: any) =>
        `${s.title} (${s.releaseYear}) [${s.mainCharacters
          .map((c: any) => c.name)
          .join(', ')}]`
    );

    return `
The user enjoys TV shows in these genres: ${genres.join(', ')}.
>>>>>>> new-features
Here's a list of shows they watched: ${showsWatched.join(', ')}.
Preferred languages: ${languages.join(', ')}.
Frequently watched main characters/actors: ${mainCharacters.join(', ')}.
Most watched shows were released around: ${avgYear}.

Considering all of these, suggest about 10 popular TV show titles that match at least 3 of these preferences.

Return TV show titles as a comma-separated list.
Do not include any other information or explanations or words.
`;
  }
  onSearch() {
    this.shows = [];
    if (!this.searchQuery) return;
    this.tmdbService.searchTvShows(this.searchQuery).subscribe((res) => {
      console.log(res);
      this.shows = res.results;
      this.shows = this.shows.filter(
        (movie) => movie.poster_path && movie.vote_average
      );
      this.numberOfItems = this.shows.length;
    });
  }

  openTrailer(tv: any) {
    this.loading = true;
    this.tmdbService.getTvDetails(tv.id).subscribe((show) => {
      this.selectedShow = show;
      this.selectedShowGenres = show.genres;

      this.tmdbService.getTvTrailer(tv.id).subscribe((res) => {
        this.trailerKey = res;
        if (res) {
          this.displayTrailerDialog = true;
          this.loading = false;
        } else {
          this.loading = false;

          this.messageService.add({
            severity: 'warn',
            summary: 'Trailer Not Available',
            detail: `${show.name} doesn't have a trailer.`,
            life: 3000,
          });
        }
        this.loading = false;
      });
    });
  }

  reset() {
    this.shows = [];
    this.searchQuery = '';
  }

  closeTrailerDialog() {
    this.displayTrailerDialog = false;
    this.trailerKey = null;
  }
  filterPanelState = 'out';
  iconState = 'default';
  isFilterPanelOpen = false;
  isMobileView = window.innerWidth <= 760;
  filterPanelStateMobile = 'out';

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobileView = window.innerWidth <= 760;
    if (this.isMobileView) {
      this.isFilterPanelOpen = false;
      this.iconState = this.isFilterPanelOpen ? 'flipped' : 'default';

      this.filterPanelState = this.isFilterPanelOpen ? 'in' : 'out';
      this.filterPanelStateMobile = this.isFilterPanelOpen ? 'in' : 'out';
    }
  }

  toggleFilterPanel() {
    this.hidePanel = false;
    this.isFilterPanelOpen = !this.isFilterPanelOpen;

    // Update the icon state based on panel state
    this.iconState = this.isFilterPanelOpen ? 'flipped' : 'default';

    // Force update of animation states
    this.filterPanelState = this.isFilterPanelOpen ? 'in' : 'out';
    this.filterPanelStateMobile = this.isFilterPanelOpen ? 'in' : 'out';
  }
  genres: any[] = [];
  yearRange: number[] = [2000, 2024];
  minRating: number = 3;
  includeAdult: boolean = false;
  fetchGenres() {
    this.tmdbService.getTvGenres().subscribe((res) => {
      this.genres = res.genres.map((g: any) => ({
        ...g,
        selected: false,
      }));
    });
  }
  selectedGenres: any[] = []; // This will hold selected genre objects

  resetFilterForm() {
    this.minRating = 3;
    this.yearRange = [2000, 2025];
    this.selectedGenres = [];
    this.includeAdult = false;
    this.isFiltered = false;

    this.onSearch();
  }
 applyFilters() {
  this.isFiltered = true;

  if (
    this.filterPanelState === 'in' ||
    this.filterPanelStateMobile === 'in'
  ) {
    const genreIds = this.selectedGenres.map((g) => g.id);

    const filters = {
      genres: genreIds,
      yearRange: this.yearRange,
      minRating: this.minRating * 2,
      includeAdult: this.includeAdult,
    };

    let request;

    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      // Search TV shows by query
      request = this.tmdbService.searchTvShows(this.searchQuery.trim());
    } else {
      // Filtered TV shows request
      request = this.tmdbService.getFilteredTvShows(filters);
    }

    request.subscribe({
      next: (res: any) => {
        let results = res.results.filter(
          (show: any) => show.poster_path && show.vote_average
        );

        // Client-side filtering (always happens)
        results = results.filter((show: any) => {
          const genreMatch =
            genreIds.length === 0 ||
            show.genre_ids?.some((id: number) => genreIds.includes(id));

          const year = show.first_air_date
            ? parseInt(show.first_air_date.substring(0, 4))
            : null;

          const yearMatch =
            !year || (year >= this.yearRange[0] && year <= this.yearRange[1]);

          const ratingMatch = show.vote_average >= filters.minRating;

          return genreMatch && yearMatch && ratingMatch;
        });

        this.shows = results;
        this.numberOfItems = this.shows.length;

        const toastelement = document.querySelector('p-toastitem');

        if (this.shows.length === 0 && !toastelement) {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Results Found.',
            detail: 'The filters you applied have no result.',
            life: 3000,
          });
        }
      },
      error: (err) => {
        console.error('Error fetching TV shows:', err);
      },
    });

    if (this.isMobileView) {
      this.toggleFilterPanel();
    }
  } else {
    this.onSearch();
  }
}

}

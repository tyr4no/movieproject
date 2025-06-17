import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { TmdbService } from '../services/tmdb.service';
import { UserService } from '../user.service';
import { GeminiService } from '../gemini.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { ConfirmationService } from 'primeng/api';
import { HostListener } from '@angular/core';
@Component({
  selector: 'movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css'],
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
      state('true', style({ transform: 'translateX(-150px)', width: '90%' })),
      transition('false <=> true', animate('300ms ease-in-out')),
    ]),
  ],
})
export class MovieListComponent implements OnInit {
  noResultsFound = false;
  isTrailerMuted = false;
  recommendedMovies: any[] = [];
  movies: any[] = [];
  topRatedMovies: any[] = [];
  topRated: any[] = [];
  action: any[] = [];
  comedy: any[] = [];
  displayTrailerDialog = false;
  loading = false;
  selectedMovie: any;
  trailerKey: string | null = null;
  selectedMovieGenres: any[] = [];
  selectedMovieDetails: any = null;
  userId: number | null = null;
  searchQuery: string = '';
  birthDate: Date = new Date();
  recommendedLoading: boolean = true;
  user: any = null;
  hidePanel = true;
  constructor(
    private tmdbService: TmdbService,
    private router: Router,
    private messageService: MessageService,
    private userService: UserService,
    private route: ActivatedRoute,
    private geminiService: GeminiService,
    private confirmationService: ConfirmationService
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
    console.log('birthdate" ', this.birthDate);
    this.recommendedMovies = new Array(5).fill(null);
    this.action = new Array(5).fill(null);
    this.comedy = new Array(5).fill(null);
    this.topRated = new Array(5).fill(null);
    const loggedInUserId = localStorage.getItem('userId');
    if (loggedInUserId) {
      this.userId = +loggedInUserId;
      this.loadRecommendedContent(+loggedInUserId);
    }

    this.tmdbService.getTopRatedMovies().subscribe((data) => {
      this.topRated = data.results.slice(0, 10);
    });

    this.tmdbService
      .getMoviesByGenre(28)
      .subscribe((data) => (this.action = data.results.slice(0, 10)));
    this.tmdbService
      .getMoviesByGenre(35)
      .subscribe((data) => (this.comedy = data.results.slice(0, 10)));

    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['query'] || '';
    });
    this.fetchGenres();
  }
  showAgeModal = false;

  openAgeModal() {
    this.showAgeModal = true;
  }

  closeAgeModal() {
    this.showAgeModal = false;
  }

  saveBirthDate() {
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

    // while waiting, fill with placeholders
    this.userService.getUserById(userId).subscribe((user) => {
      if (!user) return;

      const prompt = this.buildRecommendationPrompt(user);
      this.geminiService
        .sendMessage([{ role: 'user', parts: [{ text: prompt }] }])
        .subscribe((res) => {
          console.log('gemini response: ', res);
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
            this.tmdbService.getMovieByTitle(title)
          );

          forkJoin(titleRequests).subscribe((responses: any) => {
            const aiRecommended = responses
              .map((res: any) => res.results[0])
              .filter((item: any) => item && item.poster_path)
              .map((item: any) => ({ ...item, media_type: 'movie' }));

            this.recommendedMovies = aiRecommended.slice(0, 10);
            this.noResultsFound = this.recommendedMovies.length === 0;
          });
        });
    });
  }

  private buildRecommendationPrompt(user: any): string {
    const genres = [
      ...new Set(user.watchedMovies.flatMap((m: any) => m.genres)),
    ];
    const years = user.watchedMovies.map((m: any) => m.releaseYear);
    const languages = [
      ...new Set(user.watchedMovies.map((m: any) => m.language)),
    ];
    const mainCharacters = [
      ...new Set(
        user.watchedMovies.flatMap((m: any) =>
          m.mainCharacters.map((c: any) => c.name)
        )
      ),
    ];
    const avgYear = Math.round(
      years.reduce((a: number, b: number) => a + b, 0) / years.length
    );

    const moviesWatched = user.watchedMovies.map(
      (m: any) =>
        `${m.title} (${m.releaseYear}) [${m.mainCharacters
          .map((c: any) => c.name)
          .join(', ')}]`
    );

    return `
    i want 18+ movies only based on these:
The user enjoys movies in these genres: ${genres.join(', ')}.
Preferred languages: ${languages.join(', ')}.
Frequently watched main characters/actors: ${mainCharacters.join(', ')}.
Most watched movies were: ${moviesWatched.join(', ')}.
Most watched movies were released around: ${avgYear}.

Considering this, suggest about 10 popular movies by title that match at least 3 of these preferences.
Return movie titles as a comma-separated list.
Do not include any other information, explanations, or extra text.
`;
  }

  openTrailer(movie: any) {
    this.loading = true;
    this.tmdbService.getMovieDetails(movie.id).subscribe((movie) => {
      this.selectedMovie = movie;
      this.selectedMovieGenres = movie.genres;

      this.tmdbService.getMovieTrailer(movie.id).subscribe((res) => {
        this.trailerKey = res;
        if (res) {
          this.displayTrailerDialog = true;
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Trailer Not Available',
            detail: `${movie.title} doesn't have a trailer.`,
            life: 3000,
          });
        }
        this.loading = false;
      });
    });
  }
  selectedGenres: any[] = []; // This will hold selected genre objects

  resetFilterForm() {
    this.minRating = 5;
    this.yearRange = [2000, 2025];
    this.selectedGenres = [];
    this.includeAdult = false;
  }
  reset() {
    this.movies = [];
    this.searchQuery = '';
  }

  onSearch(): void {
    this.movies = [];
    if (this.searchQuery.trim() !== '') {
      this.tmdbService.searchMovies(this.searchQuery).subscribe((data: any) => {
        this.movies = data.results.filter(
          (movie: any) => movie.poster_path && movie.vote_average
        );
        this.noResultsFound = this.movies.length < 1;
      });
    } else {
      this.router.navigate(['/movies']);
    }
    this.resetFilterForm();
    // this.filterPanelState = 'out';
    //   this.iconState = 'default';
    //     this.isFilterPanelOpen = false;
  }

  onMovieClick(movieId: number): void {
    this.router.navigate(['/movie', movieId], {
      queryParams: { query: this.searchQuery },
    });
  }
  filterPanelState = 'out';

  iconState = 'default';
  isFilterPanelOpen = false;
  // Add this to your component
  // Add these to your component class
  isMobileView = window.innerWidth <= 460;
  filterPanelStateMobile = 'out';

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobileView = window.innerWidth <= 460;
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
  minRating: number = 5;
  includeAdult: boolean = false;
  fetchGenres() {
    this.tmdbService.getMovieGenres().subscribe((res) => {
      this.genres = res.genres.map((g: any) => ({
        ...g,
        selected: false,
      }));
    });
  }
  isFiltered = false;
  applyFilters() {
    const genreIds = this.selectedGenres.map((g) => g.id);

    const filters = {
      genres: genreIds,
      yearRange: this.yearRange,
      minRating: this.minRating * 2,
      includeAdult: this.includeAdult,
    };

    this.tmdbService.getFilteredMovies(filters).subscribe((data) => {
      this.movies = data.results;
      this.movies = this.movies.filter(
        (movie) => movie.poster_path && movie.vote_average
      );
        if (this.movies.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'No Results Found.',
            detail: 'The filters you applied has no result.',
            life: 3000,
          });
        }
    });
    this.isFiltered = true;
  }
}

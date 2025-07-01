import { Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { TmdbService } from '../services/tmdb.service';
import { UserService } from '../user.service';
import { GeminiService } from '../gemini.service';
import { AuthService } from '../auth.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
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
      state('in', style({ transform: 'translateX(-30%)', opacity: 1 })),
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
        style({ transform: 'translateX(-10px)', width: 'calc(100% - 380px)' })
      ),
      transition('false <=> true', animate('300ms ease-in-out')),
    ]),
  ],
})
export class MainPageComponent {
  numberOfItems = 0;
  noResultsFound = false;
  searchResults: any[] = [];
  topRatedMixed: any[] = [];
  actionMixed: any[] = [];
  comedyMixed: any[] = [];
  displayTrailerDialog = false;
  loading = false;
  selectedItem: any;
  recommendedForYou: any[] = [];
  recommendedMixed: any[] = [];
  userId: number | null = null;
  trailerKey: string | null = null;
  selectedItemGenres: any[] = [];
  searchQuery: string = '';
  currentUser: any;
  userPreferredGenres: string[] = [];
  user: any = null;
  birthDate: Date = new Date();
  rotateIcon = false;
  isAdult: boolean = false; // 👈 Add this
  panelCountdown = false;
  applyFilter = false;
  isFiltered = false;

  constructor(
    private tmdbService: TmdbService,
    private router: Router,
    private messageService: MessageService,
    private geminiService: GeminiService,
    private userService: UserService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}
  isMobileView = false;
  isTabletView = false;
  isDesktopView = false;

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      this.user = JSON.parse(userString);
      this.birthDate = new Date(this.user.birthdate);

      // 2) Immediately calculate age and set global isAdult
      const age = this.calculateAge(this.birthDate);
      this.userService.setIsAdult(age >= 18);
    }
    const user = this.authService.getLoggedInUser();
    if (user) {
      const birthdate = new Date(user.birthdate);
      const age = this.calculateAge(birthdate);
      this.isAdult = age >= 18;
    }
    this.recommendedMixed = new Array(5).fill(null);
    this.actionMixed = new Array(5).fill(null);
    this.comedyMixed = new Array(5).fill(null);
    this.topRatedMixed = new Array(5).fill(null);
    this.loadMixedContent();

    const loggedInUserId = localStorage.getItem('userId');
    if (loggedInUserId) {
      this.userId = +loggedInUserId;
      this.loadRecommendedContent(+loggedInUserId);
    }

    this.route.queryParams.subscribe((params: any) => {
      this.searchQuery = params['query'] || '';
      if (this.searchQuery) {
        this.onSearch();
      }
    });
    this.fetchGenres();
    this.isMobileView = window.innerWidth <= 760;
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

  private buildRecommendationPrompt(user: any): string {
    const movieGenres = user.watchedMovies.flatMap((m: any) => m.genres);
    const showGenres = user.watchedTvShows.flatMap((s: any) => s.genres);
    const genres = [...new Set([...movieGenres, ...showGenres])];

    const movieYears = user.watchedMovies.map((m: any) => m.releaseYear);
    const showYears = user.watchedTvShows.map((s: any) => s.releaseYear);
    const allYears = [...movieYears, ...showYears];

    const movieLanguages = user.watchedMovies.map((m: any) => m.language);
    const showLanguages = user.watchedTvShows.map((s: any) => s.language);
    const languages = [...new Set([...movieLanguages, ...showLanguages])];

    const movieCharacters = user.watchedMovies.flatMap((m: any) =>
      m.mainCharacters.map((c: any) => c.name)
    );
    const showCharacters = user.watchedTvShows.flatMap((s: any) =>
      s.mainCharacters.map((c: any) => c.name)
    );
    const mainCharacters = [
      ...new Set([...movieCharacters, ...showCharacters]),
    ];

    const moviesWatched = user.watchedMovies.map(
      (m: any) =>
        `${m.title} (${m.releaseYear}) [${m.mainCharacters
          .map((c: any) => c.name)
          .join(', ')}]`
    );
    const showsWatched = user.watchedTvShows.map(
      (s: any) =>
        `${s.title} (${s.releaseYear}) [${s.mainCharacters
          .map((c: any) => c.name)
          .join(', ')}]`
    );

    return `
The user enjoys content in these genres: ${genres.join(', ')}.
Preferred languages: ${languages.join(', ')}.
Frequently watched movies: ${moviesWatched.join(', ')}.
Frequently watched TV shows: ${showsWatched.join(', ')}.
Frequently watched main characters/actors: ${mainCharacters.join(', ')}.

Considering this, suggest about 10 popular movie and TV show titles,half  is movies and half is shows, shuffled, that match at least 3 of these preferences.

Return titles as a comma-separated list.
Do not include any other information, explanations, or extra text.
`;
  }
  loadRecommendedContent(userId: number): void {
    this.userService.getUserById(userId).subscribe((user) => {
      if (!user) return;

      const prompt = this.buildRecommendationPrompt(user);
      this.geminiService
        .sendMessage([{ role: 'user', parts: [{ text: prompt }] }])
        .subscribe((res) => {
          console.log('Gemini mixed response: ', res);
          const reply = res.candidates[0]?.content?.parts[0]?.text || '';
          const aiTitles = reply
            .split(',')
            .map((title: string) => title.trim())
            .filter((t: string) => t);

          if (aiTitles.length === 0) {
            this.noResultsFound = true;
            return;
          }

          const contentRequests = aiTitles.map((title: string) =>
            this.fetchContentByTitle(title)
          );

          forkJoin(contentRequests).subscribe((responses: any) => {
            const aiRecommended = responses
              .filter((item: any) => item && item.poster_path)
              .map((item: any) => ({
                ...item,
                media_type: item.media_type, // 'movie' or 'tv'
              }));

            this.recommendedMixed = aiRecommended.slice(0, 10);
            this.noResultsFound = this.recommendedMixed.length === 0;
          });
        });
    });
  }
  private fetchContentByTitle(title: string) {
    return new Promise((resolve) => {
      this.tmdbService.getMovieByTitle(title).subscribe((movieRes: any) => {
        const movieResult = movieRes.results[0];
        if (movieResult) {
          resolve({ ...movieResult, media_type: 'movie' });
        } else {
          this.tmdbService.getTvByTitle(title).subscribe((showRes: any) => {
            const showResult = showRes.results[0];
            if (showResult) {
              resolve({ ...showResult, media_type: 'tv' });
            } else {
              resolve(null);
            }
          });
        }
      });
    });
  }
  loadMixedContent(): void {
    // Load top rated mixed content
    forkJoin([
      this.tmdbService.getTopRatedMovies(),
      this.tmdbService.getTopRatedTvShows(),
    ]).subscribe(([movies, tvShows]) => {
      const movieItems = movies.results
        .filter((m: any) => m.vote_average > 0 && m.poster_path) // Filter unrated and no poster
        .map((m: any) => ({ ...m, media_type: 'movie' }));

      const tvItems = tvShows.results
        .filter((t: any) => t.vote_average > 0 && t.poster_path) // Filter unrated and no poster
        .map((t: any) => ({ ...t, media_type: 'tv' }));

      this.topRatedMixed = this.shuffleArray([...movieItems, ...tvItems]).slice(
        0,
        20
      );
    });

    // Load action mixed content
    forkJoin([
      this.tmdbService.getMoviesByGenre(28), // Action movies
      this.tmdbService.getTvShowsByGenre(10759), // Action & Adventure TV shows
    ]).subscribe(([movies, tvShows]) => {
      const movieItems = movies.results
        .filter((m: any) => m.vote_average > 0 && m.poster_path)
        .map((m: any) => ({ ...m, media_type: 'movie' }));

      const tvItems = tvShows.results
        .filter((t: any) => t.vote_average > 0 && t.poster_path)
        .map((t: any) => ({ ...t, media_type: 'tv' }));

      this.actionMixed = this.shuffleArray([...movieItems, ...tvItems]).slice(
        0,
        10
      );
    });

    forkJoin([
      this.tmdbService.getMoviesByGenre(35),
      this.tmdbService.getTvShowsByGenre(35),
    ]).subscribe(([movies, tvShows]) => {
      const movieItems = movies.results
        .filter((m: any) => m.vote_average > 0 && m.poster_path)
        .map((m: any) => ({ ...m, media_type: 'movie' }));

      const tvItems = tvShows.results
        .filter((t: any) => t.vote_average > 0 && t.poster_path)
        .map((t: any) => ({ ...t, media_type: 'tv' }));

      this.comedyMixed = this.shuffleArray([...movieItems, ...tvItems]).slice(
        0,
        10
      );
    });
  }

  // Helper function to shuffle arrays
  private shuffleArray(array: any[]): any[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  openTrailer(item: any): void {
    this.loading = true;

    if (item.media_type === 'movie') {
      this.tmdbService.getMovieDetails(item.id).subscribe((movie) => {
        this.selectedItem = movie;
        this.selectedItemGenres = movie.genres;

        this.tmdbService.getMovieTrailer(item.id).subscribe((res) => {
          this.handleTrailerResponse(res, movie.title);
        });
      });
    } else {
      this.tmdbService.getTvDetails(item.id).subscribe((tv) => {
        this.selectedItem = tv;
        this.selectedItemGenres = tv.genres;

        this.tmdbService.getTvTrailer(item.id).subscribe((res) => {
          this.handleTrailerResponse(res, tv.name);
        });
      });
    }
  }

  private handleTrailerResponse(res: string | null, title: string): void {
    this.trailerKey = res;
    if (res) {
      this.displayTrailerDialog = true;
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Trailer Not Available',
        detail: `${title} doesn't have a trailer.`,
        life: 3000,
      });
    }
    this.loading = false;
  }

  reset(): void {
    this.searchResults = [];
    this.searchQuery = '';
  }

  onSearch(): void {
    // this.searchResults = [];
    if (this.searchQuery.trim() !== '') {
      forkJoin([
        this.tmdbService.searchMovies(this.searchQuery),
        this.tmdbService.searchTvShows(this.searchQuery),
      ]).subscribe(([movieData, tvData]) => {
        const movies = movieData.results
          .filter((movie: any) => movie.poster_path && movie.vote_average)
          .map((movie: any) => ({ ...movie, media_type: 'movie' }));

        const tvShows = tvData.results
          .filter((tv: any) => tv.poster_path && tv.vote_average)
          .map((tv: any) => ({ ...tv, media_type: 'tv' }));

        this.searchResults = [...movies, ...tvShows];
        this.noResultsFound = this.searchResults.length < 1;
        this.numberOfItems = this.searchResults.length;
      });
    } else {
      this.searchResults = [];
    }
  }

  onItemClick(id: number, mediaType: 'movie' | 'tv'): void {
    if (mediaType === 'movie') {
      this.router.navigate(['/movie', id], {
        queryParams: { query: this.searchQuery },
      });
    } else {
      this.router.navigate(['/tv', id], {
        queryParams: { query: this.searchQuery },
      });
    }
  }
  filterPanelState = 'out';
  iconState = 'default';
  isFilterPanelOpen = false;
  hidePanel = true;
  filterPanelStateMobile = 'out';
  filterState = false;
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
    const element = document.querySelector('body');
    if (this.isFilterPanelOpen) {
      element?.classList.add('hidden-body');
    } else {
      element?.classList.remove('hidden-body');
    }
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
  selectedGenres: any[] = []; // This will hold selected genre objects

  resetFilterForm() {
    this.minRating = 3;
    this.yearRange = [2000, 2025];
    this.selectedGenres = [];
    this.includeAdult = false;
    this.isFiltered = false;

    this.onSearch();
  }
  fetchGenres() {
    forkJoin([
      this.tmdbService.getMovieGenres(),
      this.tmdbService.getTvGenres(),
    ]).subscribe(([movieGenres, tvGenres]) => {
      // Combine both genre lists and remove duplicates
      const combinedGenres = [...movieGenres.genres, ...tvGenres.genres];

      // Create a map to remove duplicates (genres with same ID)
      const uniqueGenresMap = new Map();
      combinedGenres.forEach((genre) => {
        if (!uniqueGenresMap.has(genre.id)) {
          uniqueGenresMap.set(genre.id, {
            ...genre,
            selected: false,
            // Add type information
            type: movieGenres.genres.some((g: any) => g.id === genre.id)
              ? ['movie']
              : ['tv'],
          });
        } else {
          // If genre exists in both, update the type array
          const existing = uniqueGenresMap.get(genre.id);
          uniqueGenresMap.set(genre.id, {
            ...existing,
            type: [
              ...existing.type,
              movieGenres.genres.some((g: any) => g.id === genre.id)
                ? 'movie'
                : 'tv',
            ],
          });
        }
      });

      // Convert back to array
      this.genres = Array.from(uniqueGenresMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    });
  }
  filterButtonPressed() {
    this.applyFilter = true;
    this.applyFilters();
  }
  applyFilters() {
    this.isFiltered = true;
    this.filterState = true;
    if (
      this.filterPanelState === 'in' ||
      this.filterPanelStateMobile === 'in'
    ) {
      const selectedGenreIds = this.selectedGenres;

      const movieGenreIds = selectedGenreIds
        .filter((g) => g.type.includes('movie'))
        .map((g) => g.id);

      const tvGenreIds = selectedGenreIds
        .filter((g) => g.type.includes('tv'))
        .map((g) => g.id);

      const filters = {
        yearRange: this.yearRange,
        minRating: this.minRating * 2,
        includeAdult: this.includeAdult,
      };

      const requests = [];

      if (this.searchQuery && this.searchQuery.trim().length > 0) {
        requests.push(
          this.tmdbService
            .searchMovies(this.searchQuery.trim())
            .pipe(map((res) => ({ ...res, media_type: 'movie' })))
        );
        requests.push(
          this.tmdbService
            .searchTvShows(this.searchQuery.trim())
            .pipe(map((res) => ({ ...res, media_type: 'tv' })))
        );
      } else {
        requests.push(
          this.tmdbService
            .getFilteredMovies({
              genres: movieGenreIds,
              yearRange: this.yearRange,
              minRating: this.minRating * 2,
              includeAdult: this.includeAdult,
            })
            .pipe(map((res) => ({ ...res, media_type: 'movie' })))
        );
        requests.push(
          this.tmdbService
            .getFilteredTvShows({
              genres: tvGenreIds,
              yearRange: this.yearRange,
              minRating: this.minRating * 2,
              includeAdult: this.includeAdult,
            })
            .pipe(map((res) => ({ ...res, media_type: 'tv' })))
        );
      }

      if (requests.length === 0) {
        this.searchResults = [];
        return;
      }

      forkJoin(requests).subscribe({
        next: (results) => {
          let combinedResults = results.flatMap((result: any) =>
            result.results
              .filter((item: any) => item.poster_path && item.vote_average)
              .map((item: any) => ({
                ...item,
                media_type: result.media_type,
              }))
          );

          // Client-side filtering
          combinedResults = combinedResults.filter((item: any) => {
            const genreMatch =
              selectedGenreIds.length === 0 ||
              item.genre_ids?.some((id: number) =>
                [...movieGenreIds, ...tvGenreIds].includes(id)
              );

            const year = item.release_date
              ? parseInt(item.release_date.substring(0, 4))
              : item.first_air_date
              ? parseInt(item.first_air_date.substring(0, 4))
              : null;

            const yearMatch =
              !year ||
              (year >= filters.yearRange[0] && year <= filters.yearRange[1]);

            const ratingMatch = item.vote_average >= filters.minRating;

            return genreMatch && yearMatch && ratingMatch;
          });

          this.searchResults = combinedResults;
          this.numberOfItems = this.searchResults.length;

          const toastelement = document.querySelector('p-toastitem');
          if (this.searchResults.length === 0 && !toastelement) {
            this.messageService.add({
              severity: 'warn',
              summary: 'No Results Found.',
              detail: 'The filters you applied have no result.',
              life: 3000,
            });
          }
        },
        error: (err) => {
          console.error('Error fetching filtered results:', err);
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

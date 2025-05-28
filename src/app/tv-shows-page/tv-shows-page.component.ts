import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { ToggleThemeService } from '../toggle-theme.service';
import { GeminiService } from '../gemini.service';
import { TmdbService } from '../services/tmdb.service';
import { UserService } from '../user.service';
@Component({
  selector: 'app-tv-shows-page',
  templateUrl: './tv-shows-page.component.html',
  styleUrl: './tv-shows-page.component.css',
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
  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 5,
      numScroll: 2,
    },
    {
      breakpoint: '1174px',
      numVisible: 4,
      numScroll: 1,
    },
    {
      breakpoint: '990px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '502px',
      numVisible: 2,
      numScroll: 2,
    },
    {
      breakpoint: '340px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  constructor(
    private tmdbService: TmdbService,
    private router: Router,
    private messageService: MessageService,
    private userService: UserService,
    private route: ActivatedRoute,
    private geminiService: GeminiService
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories() {
    const loggedInUserId = sessionStorage.getItem('userId');
    if (loggedInUserId) {
      this.userId = +loggedInUserId;
      this.loadRecommendedContent(+loggedInUserId);
    }

    this.tmdbService
      .getTopRatedTvShows()
      .subscribe((res) => (this.topRated = res.results));
    this.tmdbService
      .getTvShowsByGenre(10759)
      .subscribe((res) => (this.action = res.results));
    this.tmdbService.getTvShowsByGenre(35).subscribe((res) => {
      this.comedy = res.results;
      console.log(this.comedy);
    });
  }
  loadRecommendedContent(userId: number): void {
    this.recommendedLoading = true;
    this.recommendedShows = new Array(5).fill(null);

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
    });
  }

  openTrailer(tvId: number) {
    console.log('Clicked TV ID:', tvId); // <-- add this

    this.loading = true;
    this.tmdbService.getTvDetails(tvId).subscribe((show) => {
      this.selectedShow = show;
      this.selectedShowGenres = show.genres;

      this.tmdbService.getTvTrailer(tvId).subscribe((res) => {
        console.log('Trailer result:', res);
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
}

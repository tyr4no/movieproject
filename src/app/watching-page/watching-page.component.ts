import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { TmdbService } from '../services/tmdb.service';
import { YouTubePlayer } from '@angular/youtube-player';
import { ChangeDetectorRef } from '@angular/core';
import { forkJoin, map } from 'rxjs';
import * as movieCertifications from '../movieapi.json';
import * as tvCertifications from '../tvapi.json';
@Component({
  selector: 'app-watching-page',
  templateUrl: './watching-page.component.html',
  styleUrls: ['./watching-page.component.css'],
})
export class WatchingPageComponent implements OnInit {
  @ViewChild('ytPlayer') ytPlayer!: YouTubePlayer;
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  type: 'movie' | 'tv' = 'movie';
  trailerKey: string = 's';
  movieId = 0;
  isTVShow = false;
  playerInitialized = false;
  relatedItems: any[] = []; // for related seasons or movies

  seasonOptions: any[] = [];
  episodeOptions: any[] = [];

  selectedSeason: number | null = null;
  selectedEpisode: number | null = null;
  selectedEpisodeName: string | null = null;

  playerVars = {
    autoplay: 0,
    controls: 1,
    modestbranding: 1,
    rel: 0,
    iv_load_policy: 3,
  };
  currentWidth = 0;
  videoWidth?: number;
  videoHeight?: number;
  tvShowTitle: string = '';
  movieTitle: any;
  movieData: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tmdbService: TmdbService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // This runs when navigation begins (before leaving page)
        this.clearProgressTracking();
        this.saveWatchProgress(); // Optional: Save one last time
      }
    });
  }
  private keyboardListener = (event: KeyboardEvent) => {
    // Check if 'B' or 'b' is pressed
    if (event.key.toLowerCase() === 'b') {
      this.prevEpisode();
    }
    if (event.key.toLowerCase() === 'n') {
      this.nextEpisode();
    }
  };

  private initPlayer() {
    // No need to manually instantiate YT.Player when using Angular's YouTubePlayer component.
    // The YouTubePlayer component handles player creation automatically.
    // You can interact with the player via the @ViewChild('ytPlayer') reference.
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resize();
      window.addEventListener('resize', this.resize.bind(this));
    }, 1);
  }

  resize() {
    // console.log("resizing...")
    const w = this.container.nativeElement.clientWidth;

    this.currentWidth = window.innerWidth;
    this.videoWidth = w;
    this.videoHeight = Math.round((w * 9) / 16);
  }
  // Add to your component class
  isFocusMode = false;

  toggleFocusMode() {
    if (this.isFocusMode) {
      // if exiting focus mode
      this.isFocusMode = false;
      setTimeout(() => {
        // any cleanup if needed
      }, 300);
    } else {
      this.isFocusMode = true;
    }
  }

  exitFocusMode() {
    if (this.isFocusMode) {
      this.isFocusMode = false;
      document.body.classList.remove('focus-mode-active');
      this.cdr.detectChanges();
    }
  }
  ngOnInit() {
    this.clearProgressTracking();
    document.addEventListener('keydown', this.keyboardListener);
    // Don't call checkDescriptionLength here - movieData is not loaded yet!

    this.route.params.subscribe((params) => {
      this.movieId = params['id'];
      this.trailerKey = params['key'];
      this.type = params['type'];

      if (this.type === 'tv') {
        this.isTVShow = true;

        this.tmdbService.getTvDetails(this.movieId).subscribe((data: any) => {
          this.tvShowTitle = data.name;
          this.movieData = data; // Store the TV show data
          this.checkDescriptionLength(); // Now call it after data is loaded
          this.fetchRelatedMoviesByTitle(this.tvShowTitle);
          this.loadSeasons();
          this.tmdbService.getTvShowById(this.movieId).subscribe((res) => {});
        });
      } else {
        this.isTVShow = false;

        this.tmdbService
          .getMovieDetails(this.movieId)
          .subscribe((data: any) => {
            this.movieTitle = data.title;
            this.movieData = data; // Store the movie data
            this.checkDescriptionLength(); // Now call it after data is loaded
            this.fetchRelatedMoviesByTitle(this.movieTitle);
          });
      }
    });
  }
  loadSeasons() {
    this.tmdbService.getTVDetails(this.movieId).subscribe((data: any) => {
      this.seasonOptions = data.seasons
        .filter((s: any) => s.season_number !== 0)
        .map((season: any) => ({
          label: `Season ${season.season_number}`,
          value: season.season_number,
        }));

      if (this.seasonOptions.length) {
        this.selectedSeason = this.seasonOptions[0].value;
        this.loadEpisodes(this.selectedSeason!);
      }
    });
  }
  public hasMoreRelated: boolean = false;

  fetchRelatedMoviesByTitle(title: string) {
    this.tmdbService.searchMovies(title).subscribe((res) => {
      const movies = res.results;

      const movieObservables = movies.map((movie: any) =>
        this.tmdbService.getMovieCertifications(movie.id).pipe(
          map((certData: any) => {
            const isAdult = this.tmdbService.isAdultFromResults(
              certData.results || [],
              'movie'
            );
            return isAdult ? null : movie;
          })
        )
      );

      forkJoin(movieObservables).subscribe((filteredMovies: any) => {
        const cleanMovies = filteredMovies.filter((m: any) => m !== null);
        this.relatedItems = cleanMovies.slice(0, 5);
        this.hasMoreRelated = cleanMovies.length > 5;
      });
    });
  }
  isDescriptionExpanded = false;
  isDescriptionLong = false;

  checkDescriptionLength() {
    if (this.movieData?.overview) {
      this.isDescriptionLong = this.movieData.overview.length > 200;
    }
  }

  toggleDescription() {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  getYear(dateString: string): string {
    return dateString ? new Date(dateString).getFullYear().toString() : '';
  }

  formatRuntime(minutes: number): string {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
  goToMoreRelated(title: string) {
    this.router.navigate(['/home'], {
      queryParams: { search: this.tvShowTitle },
    });
  }

  loadEpisodes(seasonNumber: number) {
    this.tmdbService
      .getSeasonEpisodes(this.movieId, seasonNumber)
      .subscribe((data: any) => {
        this.episodeOptions = data.episodes.map((ep: any) => ({
          label: `Episode ${ep.episode_number}: ${ep.name}`,
          value: ep.episode_number,
          duration: `${ep.runtime} minutes` || 'Unknown',
        }));

        if (this.episodeOptions.length > 0) {
          this.selectedEpisode = this.episodeOptions[0].value;
          this.selectedEpisodeName =
            this.episodeOptions[0].label.split(': ')[1];
        } else {
          this.selectedEpisode = null;
          this.selectedEpisodeName = null;
        }
      });
  }

  onSeasonChange(seasonNum: number) {
    this.clearProgressTracking();
    this.onEpisodeSelect(0);
    this.selectedSeason = seasonNum;
    this.episodeOptions = [];
    this.loadEpisodes(seasonNum);
  }

  onEpisodeSelect(episodeValue: any) {
    this.clearProgressTracking();

    this.selectedEpisode = episodeValue.value;

    const episode = this.episodeOptions.find(
      (ep) => ep.value === episodeValue.value
    );
    this.selectedEpisodeName = episode
      ? episode.label.split(': ')[1] || episode.label
      : null;

    const tempKey = this.trailerKey;
    this.trailerKey = '';
    setTimeout(() => {
      this.trailerKey = tempKey;
    });
  }

  nextEpisode() {
    if (!this.episodeOptions.length) return;
    const currentIndex = this.episodeOptions.findIndex(
      (ep) => ep.value === this.selectedEpisode
    );
    const nextIndex = currentIndex + 1;
    if (nextIndex < this.episodeOptions.length) {
      this.onEpisodeSelect(this.episodeOptions[nextIndex]);
    }
  }

  prevEpisode() {
    if (!this.episodeOptions.length) return;
    const currentIndex = this.episodeOptions.findIndex(
      (ep) => ep.value === this.selectedEpisode
    );
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      this.onEpisodeSelect(this.episodeOptions[prevIndex]);
    }
  }

  currentTime = 0;
  watchProgressKey = 'watchProgress';
  progressInterval: any;
  playerState: number = 8;
  onPlayerStateChange(event: any) {
    if (event.data === 1) {
      this.playerState = 1;
      this.startProgressTracking();
      if (this.playerInitialized === false) {
        this.playerInitialized = true;
        this.seekToSavedProgress();
      }
    }
    if (event.data === 0) {
      this.playerState = 0;
      this.clearProgressTracking();

      // Optionally clear progress when finished
      this.clearWatchProgress();

      this.nextEpisode();
    }
    if (event.data === 5) {
      this.onPlayerReady();
    }
  }

  clearWatchProgress() {
    const key = `tv-${this.movieId}-s${this.selectedSeason}-e${this.selectedEpisode}`;
    const data = localStorage.getItem(this.watchProgressKey);
    const progress = data ? JSON.parse(data) : {};
    progress[key] = 0;
    localStorage.setItem(this.watchProgressKey, JSON.stringify(progress));
  }

  startProgressTracking() {
    clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      if (this.ytPlayer && this.ytPlayer.getCurrentTime) {
        this.currentTime = this.ytPlayer.getCurrentTime();
        this.saveWatchProgress();
      }
    }, 1000);
  }

  saveWatchProgress() {
    const key = `tv-${this.movieId}-s${this.selectedSeason}-e${this.selectedEpisode}`;
    const data = localStorage.getItem(this.watchProgressKey);
    const progress = data ? JSON.parse(data) : {};
    progress[key] = this.currentTime;
    localStorage.setItem(this.watchProgressKey, JSON.stringify(progress));
  }
  clearProgressTracking() {
    clearInterval(this.progressInterval);
    this.progressInterval = null;
  }

  seekToSavedProgress() {
    const key = `tv-${this.movieId}-s${this.selectedSeason}-e${this.selectedEpisode}`;
    const data = localStorage.getItem(this.watchProgressKey);
    const progress = data ? JSON.parse(data) : {};
    const savedTime = progress[key];

    if (savedTime && this.ytPlayer) {
      console.log(`Seeking to saved time: ${savedTime}`);
      this.ytPlayer.seekTo(savedTime, true);
    }
  }

  onPlayerReady() {
    console.log('YouTube Player is ready');
    this.seekToSavedProgress(); // 🔥 seek immediately when player is ready
  }
}

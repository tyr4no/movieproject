import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from '../services/tmdb.service';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
  selector: 'app-watching-page',
  templateUrl: './watching-page.component.html',
  styleUrls: ['./watching-page.component.css'],
})
export class WatchingPageComponent implements OnInit {
  @ViewChild('ytPlayer') ytPlayer!: YouTubePlayer;

  type: 'movie' | 'tv' = 'movie';
  trailerKey: string = '';
  movieId = 0;
  isTVShow = false;

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

  constructor(
    private route: ActivatedRoute,
    private tmdbService: TmdbService
  ) {}
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  videoWidth?: number;
  videoHeight?: number;

  ngAfterViewInit() {
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    const w = this.container.nativeElement.clientWidth;
    this.videoWidth = w;
    this.videoHeight = Math.round((w * 9) / 16); // 16:9 aspect
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.movieId = params['id'];
      this.trailerKey = params['key'];
      this.type = params['type'];

      if (this.type === 'tv') {
        this.isTVShow = true;
        this.loadSeasons();
      } else {
        this.isTVShow = false;
      }
    });
  }

  loadSeasons() {
    this.tmdbService.getTVDetails(this.movieId).subscribe((data: any) => {
      this.seasonOptions = data.seasons
        .filter((s: any) => s.season_number !== 0) // remove season 0
        .map((season: any) => ({
          label: `Season ${season.season_number}`,
          value: season.season_number,
        }));

      if (this.seasonOptions.length) {
        this.selectedSeason = this.seasonOptions[0].value;
        if (this.selectedSeason !== null) {
          this.loadEpisodes(this.selectedSeason);
        }
      }
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
    this.selectedSeason = seasonNum;
    this.episodeOptions=[];
    this.loadEpisodes(seasonNum);
  }

  onEpisodeSelect(episodeValue: any) {
    this.selectedEpisode = episodeValue.value;

    const episode = this.episodeOptions.find(
      (ep) => ep.value === episodeValue.value
    );

    if (episode) {
      this.selectedEpisodeName = episode.label.split(': ')[1] || episode.label;
    } else {
      this.selectedEpisodeName = null;
    }

    const tempKey = this.trailerKey;
    this.trailerKey = '';
    setTimeout(() => {
      this.trailerKey = tempKey;
      setTimeout(() => {
        this.seekToSavedProgress();
      }, 500); // Give player time to initialize
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

  onPlayerStateChange(event: any) {
    console.log(event.data);

    // state 1 is playing
    if (event.data === 1) {
      this.startProgressTracking();
    }
    // state 2 is paused, state 0 is ended
    if (event.data === 2 || event.data === 0) {
      this.saveWatchProgress();
      if (event.data === 0) {
        this.nextEpisode();
      }
    }
  }
  progressInterval: any;

  startProgressTracking() {
    clearInterval(this.progressInterval);
    this.progressInterval = setInterval(() => {
      if (this.ytPlayer && this.ytPlayer.getCurrentTime) {
        this.currentTime = this.ytPlayer.getCurrentTime();
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
  seekToSavedProgress() {
    const key = `tv-${this.movieId}-s${this.selectedSeason}-e${this.selectedEpisode}`;
    const data = localStorage.getItem(this.watchProgressKey);
    const progress = data ? JSON.parse(data) : {};

    const savedTime = progress[key];
    if (savedTime && this.ytPlayer && this.ytPlayer.seekTo) {
      this.ytPlayer.seekTo(savedTime, true);
    }
  }

onPlayerReady(event: YT.PlayerEvent) {
  console.log('YouTube Player is ready:', event.target);
}
}

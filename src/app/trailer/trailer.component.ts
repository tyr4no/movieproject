import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { YouTubePlayer } from '@angular/youtube-player';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { VolumeService } from '../volume.service';
@Component({
  selector: 'trailer-dialog',
  templateUrl: './trailer.component.html',
  styleUrl: './trailer.component.css',
})
export class TrailerComponent {
  @Input() display: boolean = false;
  @Input() trailerKey!: string | null;
  loading = false;

  @Input() selectedMovie: any;
  @Input() selectedMovieGenres: any[] = [];
  playerVars = {
    autoplay: 1,

    controls: 0, // hide controls
    modestbranding: 1, // hides the YouTube logo in control bar
    rel: 0, // disables related videos at the end
    showinfo: 0, // **deprecated**, but no longer works reliably
    iv_load_policy: 3, // hides annotations
  };

  @Output() onClose = new EventEmitter<void>();
  closeDialog() {
    this.onClose.emit();
  }
  @ViewChild('ytPlayer') ytPlayer!: YouTubePlayer;

  isMuted = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private volumeService: VolumeService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.isMuted = this.volumeService.getMute().value;
      if (this.isMuted) {
        this.ytPlayer.mute();
      } else {
        this.ytPlayer.unMute();
      }
    }, 1);

    // if (changes['trailerKey']) {
    //   setTimeout(() => {
    //     this.isMuted = this.volumeService.getMute().value;
    //     if (this.isMuted) {
    //       this.ytPlayer.mute();
    //     } else {
    //       this.ytPlayer.unMute();
    //     }
    //   }, 1);

    //   // this.isMuted = false;
    // }
  }
  onPlayerReady() {
    console.log('REady');
    setTimeout(() => {
      this.isMuted = this.volumeService.getMute().value;
      if (this.isMuted) {
        this.ytPlayer.mute();
      } else {
        this.ytPlayer.unMute();
      }
    }, 1);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.ytPlayer.mute();
    } else {
      this.ytPlayer.unMute();
    }
    this.volumeService.setMute(this.isMuted);
  }
}

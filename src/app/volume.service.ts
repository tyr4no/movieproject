import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VolumeService {
  mute = new BehaviorSubject<boolean>(false);
  constructor() {}
  setMute(mute: boolean) {
    this.mute.next(mute);
  }
  getMute(){
    return this.mute;
  }
}

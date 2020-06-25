export interface KitObject {
  [char: string]: string;
}

export interface TrackStateObject {
  mute: boolean;
  solo: boolean;
  volume: number;
}

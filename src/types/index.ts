export interface KitObject {
  [char: string]: string;
}

export interface PresetObject {
  name: string;
  producer: string;
  pattern: Array<Array<{ active: boolean }>>;
  tracksStates: Array<TrackStateObject>;
  tempo: number;
}

export interface TrackStateObject {
  mute: boolean;
  solo: boolean;
  volume: number;
}

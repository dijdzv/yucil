export class Playlists {
  public items: Playlist[];
  public playlistId: string | undefined;

  constructor(playlists: Playlist[], playlistId?: string) {
    this.items = playlists;
    this.playlistId = playlistId;
  }

  /**
   * You need to check with isExistPlaylist before using this.
   * Always succeeds if droppableId is used for playlistId
   */
  public getPlaylist(playlistId?: string): Playlist {
    return this.items.find((playlist) => playlist.id === playlistId) as Playlist;
  }

  public getPlayingPlaylist(): Playlist {
    return this.getPlaylist(this.playlistId);
  }

  public setPlaylistId(playlistId: string) {
    this.playlistId = playlistId;
  }

  public setPlaylistIndex(playlistId: string, index: number) {
    this.getPlaylist(playlistId).index = index;
  }

  public setPlayingPlaylistIndex(index: number) {
    this.getPlayingPlaylist().index = index;
  }

  public isPlayingPlaylist(playlistId: string): boolean {
    return this.playlistId === playlistId;
  }

  public isPlayingPosition(playlistId: string, index: number): boolean {
    return this.isPlayingPlaylist(playlistId) && this.getPlayingPlaylist().index === index;
  }

  public isExistPlaylist(playlistId: string): boolean {
    return this.items.some((playlist) => playlist.id === playlistId);
  }

  public deselectPlaylist() {
    this.playlistId = undefined;
  }

  public copy(): Playlists {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

export type Playlist = {
  id: string;
  title: string;
  thumbnail: string;
  items: PlaylistItem[];
  index: number;
};

export type PlaylistItem = {
  id: string;
  title: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  position: number;
  resourceId: {
    kind: string;
    videoId: string;
  };
  playlistId: string;
};

import { Dispatch, SetStateAction } from 'react';
import { Playlist, PlaylistItem, Playlists } from './class/playlists';
import { DraggableLocation } from 'react-beautiful-dnd';
import axios from 'axios';

const YOUTUBE_API_URL = {
  PLAYLISTS: 'https://www.googleapis.com/youtube/v3/playlists',
  PLAYLIST_ITEMS: 'https://www.googleapis.com/youtube/v3/playlistItems',
};

export async function fetchPlaylists(accessToken: string, setPlaylists: Dispatch<SetStateAction<Playlists>>) {
  const { data: playlistsData } = (await axios.get(YOUTUBE_API_URL.PLAYLISTS, {
    params: {
      part: 'snippet',
      mine: true,
      maxResults: 50,
      access_token: accessToken,
    },
  })) as { data: gapi.client.youtube.PlaylistListResponse };

  const playlists = playlistsData.items;
  if (!playlists) return;

  playlists.sort((a, b) => {
    return a.snippet?.title?.localeCompare(b.snippet?.title || '') || 0;
  });

  const playlistsPromise = playlists.map(async (playlist) => {
    const playlistsItems: PlaylistItem[] = [];
    let nextPageToken = undefined;
    while (true) {
      const { data: playlistItemsData } = (await axios.get(YOUTUBE_API_URL.PLAYLIST_ITEMS, {
        params: {
          part: 'snippet',
          playlistId: playlist.id,
          maxResults: 50,
          pageToken: nextPageToken,
          access_token: accessToken,
        },
      })) as { data: gapi.client.youtube.PlaylistItemListResponse };
      const items = playlistItemsData.items?.map((playlistItem) => ({
        id: playlistItem.id || 'undefined',
        title: playlistItem.snippet?.title || 'undefined',
        thumbnail: playlistItem.snippet?.thumbnails?.default?.url || '',
        channelId: playlistItem.snippet?.videoOwnerChannelId || 'undefined',
        channelTitle: playlistItem.snippet?.videoOwnerChannelTitle || 'undefined',
        position: playlistItem.snippet?.position || 0,
        resourceId: {
          kind: playlistItem.snippet?.resourceId?.kind || '',
          videoId: playlistItem.snippet?.resourceId?.videoId || '',
        },
        playlistId: playlist.id || 'undefined',
      }));
      playlistsItems.push(...(items || []));
      nextPageToken = playlistItemsData.nextPageToken;
      if (!nextPageToken) break;
    }
    return {
      id: playlist.id || 'undefined',
      title: playlist.snippet?.title || 'undefined',
      thumbnail: playlist.snippet?.thumbnails?.default?.url || '',
      items: playlistsItems,
      index: 0,
    } as Playlist;
  });

  Promise.all(playlistsPromise).then((newPlaylists) => {
    setPlaylists(new Playlists(newPlaylists, playlists?.at(0)?.id));
  });
}

export const insertPlaylistItem = (
  accessToken: string,
  playlists: Playlists,
  source: DraggableLocation,
  destination: DraggableLocation
): boolean => {
  const sourcePlaylist = playlists.getPlaylist(source.droppableId);
  const destinationPlaylist = playlists.getPlaylist(destination.droppableId);
  const sourcePlaylistItem = sourcePlaylist.items[source.index];
  const destinationPlaylistItem = destinationPlaylist.items[destination.index];

  axios
    .post(
      YOUTUBE_API_URL.PLAYLIST_ITEMS,
      {
        snippet: {
          playlistId: destinationPlaylistItem.playlistId,
          resourceId: {
            kind: destinationPlaylistItem.resourceId.kind,
            videoId: sourcePlaylistItem.resourceId.videoId,
          },
          position: destinationPlaylistItem.position,
        },
      },
      {
        params: {
          part: 'snippet',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
      return false;
    });

  return true;
};

export const updatePlaylistItem = (
  accessToken: string,
  playlists: Playlists,
  source: DraggableLocation,
  destination: DraggableLocation
): boolean => {
  const sourcePlaylist = playlists.getPlaylist(source.droppableId);
  const destinationPlaylist = playlists.getPlaylist(destination.droppableId);
  const sourcePlaylistItem = sourcePlaylist.items[source.index];
  const destinationPlaylistItem = destinationPlaylist.items[destination.index];

  axios
    .put(
      YOUTUBE_API_URL.PLAYLIST_ITEMS,
      {
        id: sourcePlaylistItem.id,
        snippet: {
          playlistId: destinationPlaylistItem.playlistId,
          resourceId: {
            channelId: sourcePlaylistItem.channelId,
            kind: sourcePlaylistItem.resourceId.kind,
            playlistId: sourcePlaylistItem.playlistId,
            videoId: sourcePlaylistItem.resourceId.videoId,
          },
          position: destinationPlaylistItem.position,
        },
      },
      {
        params: {
          part: 'snippet',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
      return false;
    });

  return true;
};

export const deletePlaylistItem = (accessToken: string, playlists: Playlists, source: DraggableLocation): boolean => {
  const sourcePlaylist = playlists.getPlaylist(source.droppableId);
  const sourcePlaylistItem = sourcePlaylist.items[source.index];

  axios
    .delete(YOUTUBE_API_URL.PLAYLIST_ITEMS, {
      params: {
        id: sourcePlaylistItem.id,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
      return false;
    });

  return true;
};

import { Dispatch, SetStateAction } from 'react';
import { Playlist, PlaylistItem, Playlists } from './class/playlists';
import { DraggableLocation } from 'react-beautiful-dnd';
import axios from 'axios';

const YOUTUBE_API_URL = {
  PLAYLISTS: 'https://www.googleapis.com/youtube/v3/playlists',
  PLAYLIST_ITEMS: 'https://www.googleapis.com/youtube/v3/playlistItems',
};

export async function fetchPlaylists(setPlaylists: Dispatch<SetStateAction<Playlists>>, accessToken: string) {
  if (!accessToken) return;

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
          access_token: accessToken,
          pageToken: nextPageToken,
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
  playlists: Playlists,
  source: DraggableLocation,
  destination: DraggableLocation
): boolean => {
  const sourcePlaylist = playlists.getPlaylist(source.droppableId);
  const destinationPlaylist = playlists.getPlaylist(destination.droppableId);
  const sourcePlaylistItem = sourcePlaylist.items[source.index];
  const destinationPlaylistItem = destinationPlaylist.items[destination.index];

  gapi.client.youtube.playlistItems
    .insert({
      part: 'snippet',
      resource: {
        snippet: {
          playlistId: destinationPlaylistItem.playlistId,
          resourceId: {
            kind: destinationPlaylistItem.resourceId.kind,
            videoId: sourcePlaylistItem.resourceId.videoId,
          },
          position: destinationPlaylistItem.position,
        },
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

export const updatePlaylistItems = (
  playlists: Playlists,
  source: DraggableLocation,
  destination: DraggableLocation
): boolean => {
  const sourcePlaylist = playlists.getPlaylist(source.droppableId);
  const destinationPlaylist = playlists.getPlaylist(destination.droppableId);
  const sourcePlaylistItem = sourcePlaylist.items[source.index];
  const destinationPlaylistItem = destinationPlaylist.items[destination.index];
  gapi.client.youtube.playlistItems
    .update({
      part: 'snippet',
      resource: {
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

export const deletePlaylistItem = (playlists: Playlists, source: DraggableLocation): boolean => {
  const sourcePlaylist = playlists.getPlaylist(source.droppableId);
  const sourcePlaylistItem = sourcePlaylist.items[source.index];

  gapi.client.youtube.playlistItems
    .delete({
      id: sourcePlaylistItem.id,
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

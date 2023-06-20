import { Dispatch, SetStateAction } from 'react';
import { Playlist, PlaylistItem, Playlists } from './components/Dashboard';
import { DraggableLocation } from 'react-beautiful-dnd';

const YOUTUBE_API_URL = {
  PLAYLISTS: 'https://www.googleapis.com/youtube/v3/playlists',
  PLAYLIST_ITEMS: 'https://www.googleapis.com/youtube/v3/playlistItems',
};

export const fetchPlaylists = (setPlaylists: Dispatch<SetStateAction<Playlists>>, accessToken: string) => {
  gapi.client.youtube.playlists
    .list({
      part: 'snippet',
      mine: true,
      maxResults: 50,
    })
    .then((playlistsResponse) => {
      // console.log('playlistsResponse', playlistsResponse);
      const playlists = playlistsResponse.result.items;
      playlists?.sort((a, b) => {
        return a.snippet?.title?.localeCompare(b.snippet?.title || '') || 0;
      });
      const playlistsPromise: Promise<Playlist>[] =
        playlists?.map(async (playlist, playlistIndex) => {
          return gapi.client.youtube.playlistItems
            .list({
              part: 'snippet',
              playlistId: playlist.id,
              maxResults: 50,
            })
            .then((playlistItemListResponse) => {
              // TODO: playlistItemListResponse.result.pageInfo.totalResultsの回数取得するようにする
              // console.log('playlistItemListResponse', playlistItemListResponse);
              const playlistItems = playlistItemListResponse.result.items;
              const newPlaylistItems: PlaylistItem[] =
                playlistItems?.map((playlistItem) => {
                  return {
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
                  };
                }) || [];
              return {
                id: playlist.id || 'undefined',
                title: playlist.snippet?.title || 'undefined',
                thumbnail: playlist.snippet?.thumbnails?.default?.url || '',
                items: newPlaylistItems,
                index: 0,
              };
            })
            .catch((err) => {
              console.log(err);
              return {
                id: 'undefined',
                title: 'undefined',
                thumbnail: '',
                items: [],
                index: 0,
              };
            });
        }) || [];
      Promise.all(playlistsPromise).then((newPlaylists) => {
        setPlaylists(new Playlists(newPlaylists, playlists?.at(0)?.id));
      });
    })
    .catch((err) => console.log(err));
};

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

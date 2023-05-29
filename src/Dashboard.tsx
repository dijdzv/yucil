import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Container } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
// import GridLayout from 'react-grid-layout';
import { DragDropContext, type DropResult } from 'react-beautiful-dnd';
import Bar from './Bar';
import List from './List';
import { MusicPlayer, MusicPlayerRefHandle } from './Player';
import { deletePlaylistItem, getPlaylists, updatePlaylistItems } from './api';
import { insertPlaylistItem } from './api';
// import { invoke } from '@tauri-apps/api';

export const BASE_PLAYLIST_URL = 'https://www.youtube.com/playlist?list=';

type TrashContextProps = {
  trash: PlaylistItem[];
  setTrash: React.Dispatch<React.SetStateAction<PlaylistItem[]>>;
};

export const TrashContext = React.createContext({} as TrashContextProps);

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

export default function Dashboard() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode]
  );
  const [playlists, setPlaylists] = useState<Playlists>(new Playlists([], undefined));
  const [trash, setTrash] = useState<PlaylistItem[]>([]);

  const ref = useRef({} as MusicPlayerRefHandle);

  useEffect(() => {
    getPlaylists(setPlaylists);
  }, []);

  console.log('playlist change: ', playlists.getPlayingPlaylist());

  // TODO: setTimeoutやsetIntervalを使わない方法を考える
  // TODO: handleOnReadyを使う
  const handlePlaylistAt = (newPlaylist: Playlist, index: number) => {
    if (playlists.isPlayingPlaylist(newPlaylist.id)) {
      if (!playlists.isPlayingPosition(newPlaylist.id, index)) {
        setPlaylists((prev) => {
          prev.setPlayingPlaylistIndex(index);
          return prev.copy();
        });
        ref.current.handlePlaylistAt(index);
      }
    } else {
      handlePlaylist({ ...newPlaylist, index });
      setTimeout(() => {
        ref.current.handlePlaylistAt(index);
      }, 1000);
    }
  };

  const handlePlaylist = (newPlaylist: Playlist) => {
    if (playlists.isPlayingPlaylist(newPlaylist.id)) return;
    setPlaylists((prev) => {
      prev.deselectPlaylist();
      return prev.copy();
    });
    setTimeout(() => {
      setPlaylists((prev) => {
        prev.setPlaylistId(newPlaylist.id);
        return prev.copy();
      });
      handlePlaying(true);
    }, 200);
  };

  const handlePlaying = (playing: boolean) => {
    ref.current.handlePlaying(playing);
  };

  const reorder = (prev: Playlists, startIndex: number, startId: string, endIndex: number, endId: string) => {
    const result = prev;
    const startPlaylist = result.getPlaylist(startId);

    const [removed] = startPlaylist.items.splice(startIndex, 1);
    result.getPlaylist(endId).items.splice(endIndex, 0, removed);
    console.log('reorder', result);
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    const isNotDropped = !destination;
    if (isNotDropped) {
      return;
    }

    const isSamePlaylist = source.droppableId === destination.droppableId;
    const isSamePosition = isSamePlaylist && source.index === destination.index;
    if (isSamePosition) {
      return;
    }

    if (destination.droppableId === 'trash') {
      setPlaylists((prev) => {
        const isDeleteSuccess = deletePlaylistItem(prev, source);
        if (isDeleteSuccess) {
          const deleted = prev.getPlaylist(source.droppableId).items.splice(source.index, 1)[0];
          deleted &&
            setTrash((prev) => {
              return [...prev, deleted];
            });
        }
        return prev.copy();
      });
      return;
    }

    // TODO: setPlaylistsが実行されるのを一度にする
    // TODO: 異なるプレイリストに移す時、現在の再生時間に戻す
    const isNowPlaying = playlists.isPlayingPosition(source.droppableId, source.index);
    if (isNowPlaying) {
      setPlaylists((prev) => {
        if (isSamePlaylist) {
          prev.setPlayingPlaylistIndex(destination.index);
          return prev.copy();
        } else {
          prev.setPlaylistId(destination.droppableId);
          prev.setPlaylistIndex(destination.droppableId, destination.index);
          return prev.copy();
        }
      });
    }

    if (isSamePlaylist) {
      setPlaylists((prev) => {
        const isSuccess = updatePlaylistItems(prev, source, destination);
        if (isSuccess) {
          return reorder(prev, source.index, source.droppableId, destination.index, destination.droppableId);
        }
        return prev.copy();
      });
    } else {
      setPlaylists((prev) => {
        const isDeleteSuccess = deletePlaylistItem(prev, source);
        const isInsertSuccess = isDeleteSuccess && insertPlaylistItem(prev, source, destination);
        if (isDeleteSuccess && isInsertSuccess) {
          return reorder(prev, source.index, source.droppableId, destination.index, destination.droppableId);
        }
        return prev.copy();
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <TrashContext.Provider value={{ trash, setTrash }}>
            <Bar playlists={playlists} setPlaylists={setPlaylists} handlePlaying={handlePlaying} />
          </TrashContext.Provider>
          <Box
            component="main"
            sx={{
              // backgroundColor: (theme) =>
              //   theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
              flexGrow: 1,
              height: '100vh',
              overflow: 'hidden',
            }}
          >
            {/* // TODO: Grid layout  */}
            <Container
              maxWidth="lg"
              sx={{
                p: 1,
                mt: '4rem',
                height: 'calc(100% - 4rem)',
                position: 'relative',
                display: 'flex',
                flexWrap: 'wrap',
                rowGap: '0',
              }}
            >
              <MusicPlayer playlists={playlists} setPlaylists={setPlaylists} ref={ref} />
              {playlists.items.map((playlistsItem: Playlist) => (
                <List
                  playlists={playlists}
                  playlistsItem={playlistsItem}
                  key={playlistsItem.id}
                  handlePlaylist={handlePlaylist}
                  handlePlaylistAt={handlePlaylistAt}
                />
              ))}
            </Container>
          </Box>
        </Box>
      </DragDropContext>
    </ThemeProvider>
  );
}

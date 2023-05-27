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

export type Playlist = {
  id: string;
  title: string;
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
  const [playlist, setPlaylist] = useState<Playlist>();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [trash, setTrash] = useState<PlaylistItem[]>([]);

  const ref = useRef({} as MusicPlayerRefHandle);

  useEffect(() => {
    getPlaylists(setPlaylist, setPlaylists);
  }, []);

  console.log('playlist change: ', playlist);

  // TODO: setTimeoutやsetIntervalを使わない方法を考える
  // TODO: handleOnReadyを使う
  const handlePlaylistAt = (newPlaylist: Playlist, index: number) => {
    if (playlist?.id === newPlaylist.id) {
      if (playlist.index !== index) {
        setPlaylist((prev) => {
          return { ...prev, index } as Playlist;
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

  const handlePlaylist = (newPlaylist?: Playlist) => {
    if (playlist?.id === newPlaylist?.id) return;
    setPlaylist(undefined);
    setTimeout(() => {
      setPlaylist(newPlaylist);
      handlePlaying(true);
    }, 200);
  };

  const handlePlaying = (playing: boolean) => {
    ref.current.handlePlaying(playing);
  };

  const reorder = (prev: Playlist[], startIndex: number, startId: string, endIndex: number, endId: string) => {
    const result = prev;
    const startPlaylist = result.find((playlist) => playlist.id === startId);
    if (startPlaylist === undefined) {
      console.log('filed reorder', result);
      return result;
    }
    const [removed] = startPlaylist.items.splice(startIndex, 1);
    result.find((playlist) => playlist.id === endId)?.items.splice(endIndex, 0, removed);
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
          const deleted = prev.find((playlist) => playlist.id === source.droppableId)?.items.splice(source.index, 1)[0];
          deleted &&
            setTrash((prev) => {
              return [...prev, deleted];
            });
        }
        return prev;
      });
      return;
    }

    // TODO: この時、現在の再生時間に戻す
    const isNowPlaying = playlist?.id === source.droppableId && playlist?.index === source.index;
    if (isNowPlaying) {
      setPlaylist((prev) => {
        if (isSamePlaylist) {
          return { ...prev, index: destination.index } as Playlist;
        } else {
          const destinationPlaylist = playlists.find((playlist) => playlist.id === destination.droppableId);
          if (!destinationPlaylist) return prev;
          return { ...destinationPlaylist, index: destination.index } as Playlist;
        }
      });
    }

    if (isSamePlaylist) {
      setPlaylists((prev) => {
        const isSuccess = updatePlaylistItems(prev, source, destination);
        if (isSuccess) {
          return reorder(prev, source.index, source.droppableId, destination.index, destination.droppableId);
        }
        return prev;
      });
    } else {
      setPlaylists((prev) => {
        const isDeleteSuccess = deletePlaylistItem(prev, source);
        const isInsertSuccess = isDeleteSuccess && insertPlaylistItem(prev, source, destination);
        if (isDeleteSuccess && isInsertSuccess) {
          return reorder(prev, source.index, source.droppableId, destination.index, destination.droppableId);
        }
        return prev;
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <TrashContext.Provider value={{ trash, setTrash }}>
            <Bar
              playlists={playlists}
              handlePlaylist={handlePlaylist}
              setPlaylist={setPlaylist}
              setPlaylists={setPlaylists}
              handlePlaying={handlePlaying}
            />
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
              <MusicPlayer playlist={playlist} setPlaylist={setPlaylist} ref={ref} />
              {playlists.map((playlistsItem: Playlist, index: number) => (
                <List
                  playlist={playlist}
                  playlistsItem={playlistsItem}
                  index={index}
                  key={playlistsItem.id}
                  handlePlaylist={handlePlaylist}
                  handlePlaylistAt={handlePlaylistAt}
                />
              ))}
              {/* <Trash /> */}
            </Container>
          </Box>
        </Box>
      </DragDropContext>
    </ThemeProvider>
  );
}

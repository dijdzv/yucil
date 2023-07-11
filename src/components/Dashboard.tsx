import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Container } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
// import GridLayout from 'react-grid-layout';
import { DragDropContext, type DropResult } from 'react-beautiful-dnd';
import Bar from './Bar';
import List from './List';
import { MusicPlayer, MusicPlayerRefHandle } from './Player';
import { deletePlaylistItem, fetchPlaylists, updatePlaylistItem, insertPlaylistItem } from '../api';
import { useGoogleLogin } from '@react-oauth/google';
import { Playlist, PlaylistItem, Playlists } from '../class/playlists';
// import { invoke } from '@tauri-apps/api';

export const BASE_PLAYLIST_URL = 'https://www.youtube.com/playlist?list=';

type TrashContextProps = {
  trash: PlaylistItem[];
  setTrash: React.Dispatch<React.SetStateAction<PlaylistItem[]>>;
};

export const TrashContext = React.createContext({} as TrashContextProps);

type PlaylistsContextProps = {
  playlists: Playlists;
  setPlaylists: React.Dispatch<React.SetStateAction<Playlists>>;
};

export const PlaylistsContext = React.createContext({} as PlaylistsContextProps);

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

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlists>(new Playlists([], undefined));
  const [trash, setTrash] = useState<PlaylistItem[]>([]);

  const ref = useRef({} as MusicPlayerRefHandle);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setAccessToken(codeResponse.access_token),
    onError: (error) => console.error(error),
    onNonOAuthError: (error) => console.error(error),
    flow: 'implicit',
    scope: 'https://www.googleapis.com/auth/youtube',
  });

  useEffect(() => {
    setTimeout(() => {
      login();
    }, 100);
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    fetchPlaylists(accessToken, setPlaylists);
  }, [accessToken]);

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
      handlePlaylist(newPlaylist, index);
      setTimeout(() => {
        ref.current.handlePlaylistAt(index);
      }, 1000);
    }
  };

  const handlePlaylist = (newPlaylist: Playlist, index?: number) => {
    const newIndex = index === undefined ? newPlaylist.index : index;
    if (playlists.isPlayingPlaylist(newPlaylist.id)) return;
    setPlaylists((prev) => {
      prev.deselectPlaylist();
      return prev.copy();
    });
    setTimeout(() => {
      setPlaylists((prev) => {
        prev.setPlaylistId(newPlaylist.id);
        prev.setPlaylistIndex(newPlaylist.id, newIndex);
        return prev.copy();
      });
    }, 200);
  };

  const handlePlaying = (playing: boolean) => {
    ref.current.handlePlaying(playing);
  };

  const getPlayingPlaylistUrl = (): string => {
    return ref.current.getVideoUrl();
  };

  const reorder = (prev: Playlists, startIndex: number, startId: string, endIndex: number, endId: string) => {
    const result = prev;
    const startPlaylist = result.getPlaylist(startId);

    const [removed] = startPlaylist.items.splice(startIndex, 1);
    result.getPlaylist(endId).items.splice(endIndex, 0, removed);
    console.log('reorder', result);
    return result;
  };

  // TODO: api操作が失敗したときの処理
  const onDragEnd = (result: DropResult) => {
    if (!accessToken) return;

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
        deletePlaylistItem(accessToken, prev, source);

        const deleted = prev.getPlaylist(source.droppableId).items.splice(source.index, 1)[0];
        deleted &&
          setTrash((prev) => {
            return [...prev, deleted];
          });

        return prev.copy();
      });
      return;
    }

    // TODO: 異なるプレイリストに移す時、現在の再生時間に戻す
    //! FIXME: updateしたとき、なんかずれてる
    //! FIXME: 異なるプレイリストに移す時再生中の動画を保持する
    const isPlayingVideo = playlists.isPlayingPosition(source.droppableId, source.index);
    const isEqDstAndPlaying =
      playlists.isPlayingPlaylist(source.droppableId) && playlists.isPlayingPlaylist(destination.droppableId);
    const isPlayingUpDst =
      (isSamePlaylist &&
        isEqDstAndPlaying &&
        playlists.getPlayingPlaylist().index < source.index &&
        playlists.getPlayingPlaylist().index >= destination.index) ||
      (!isSamePlaylist && playlists.getPlayingPlaylist().index >= destination.index);

    if (isSamePlaylist) {
      setPlaylists((prev) => {
        isPlayingVideo && prev.setPlayingPlaylistIndex(destination.index);
        isPlayingUpDst && prev.setPlayingPlaylistIndex(prev.getPlayingPlaylist().index + 1);
        updatePlaylistItem(accessToken, prev, source, destination);
        return reorder(prev, source.index, source.droppableId, destination.index, destination.droppableId);
      });
    } else {
      setPlaylists((prev) => {
        if (isPlayingVideo) {
          prev.setPlaylistId(destination.droppableId);
          prev.setPlaylistIndex(destination.droppableId, destination.index);
        }
        isPlayingUpDst && prev.setPlayingPlaylistIndex(prev.getPlayingPlaylist().index + 1);
        deletePlaylistItem(accessToken, prev, source);
        insertPlaylistItem(accessToken, prev, source, destination);
        return reorder(prev, source.index, source.droppableId, destination.index, destination.droppableId);
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <DragDropContext onDragEnd={onDragEnd}>
        <PlaylistsContext.Provider value={{ playlists, setPlaylists }}>
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <TrashContext.Provider value={{ trash, setTrash }}>
              <Bar handlePlaying={handlePlaying} getPlayingPlaylistUrl={getPlayingPlaylistUrl} login={login} />
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
                <MusicPlayer ref={ref} />
                {playlists.items.map((playlistsItem: Playlist) => (
                  <List
                    playlistsItem={playlistsItem}
                    key={playlistsItem.id}
                    handlePlaylist={handlePlaylist}
                    handlePlaylistAt={handlePlaylistAt}
                  />
                ))}
              </Container>
            </Box>
          </Box>
        </PlaylistsContext.Provider>
      </DragDropContext>
    </ThemeProvider>
  );
}

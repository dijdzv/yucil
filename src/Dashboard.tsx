import { useMemo, useState, useEffect, useRef } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Container } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
// import GridLayout from 'react-grid-layout';
import { DragDropContext, type DropResult } from 'react-beautiful-dnd';
import Bar from './Bar';
import List from './List';
import Trash from './Trash';
import { UrlPlayer, MusicPlayer } from './Player';
import { getPlaylists } from './api';
// import { invoke } from '@tauri-apps/api';

export interface Playlist {
  id: string;
  title: string;
  items: PlaylistItem[];
}

export type PlaylistItem = {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  position: number;
  resourceId: {
    kind: string;
    videoId: string;
  };
  playlistIndex: number;
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
  const [url, setUrl] = useState<string>();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    getPlaylists(setPlaylists, setUrl);
  }, []);

  const reorder = (prev: Playlist[], startIndex: number, startId: number, endIndex: number, endId: number) => {
    const result = prev;
    const [removed] = result[startId].items.splice(startIndex, 1);
    result[endId].items.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    const isNotDropped = !destination;
    if (isNotDropped) {
      return;
    }

    const isSamePosition = source.droppableId === destination.droppableId && source.index === destination.index;
    if (isSamePosition) {
      return;
    }

    if (destination.droppableId === 'trash') {
      setPlaylists((prev: Playlist[]) => {
        prev[Number(source.droppableId)].items.splice(source.index, 1);
        return prev;
      });
      return;
    }

    setPlaylists((prev: Playlist[]) =>
      reorder(prev, source.index, Number(source.droppableId), destination.index, Number(destination.droppableId))
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Bar setPlaylists={setPlaylists} />
        <Box
          component="main"
          sx={{
            // backgroundColor: (theme) =>
            //   theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            // overflow: 'hidden',
          }}
        >
          <Container
            maxWidth="lg"
            sx={{ p: 1, mt: '4rem', height: 'calc(100% - 4rem)', position: 'relative', display: 'flex' }}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              <MusicPlayer url={url} intervalRef={intervalRef} />
              {/* <UrlPlayer /> */}
              <Box sx={{ display: 'flex', justifyContent: 'space-evenly', height: '100%' }}>
                {playlists.map((playlist: Playlist, index: number) => (
                  <List
                    playlist={playlist}
                    setPlaylists={setPlaylists}
                    index={index}
                    key={playlist.id}
                    setUrl={setUrl}
                    intervalRef={intervalRef}
                  />
                ))}
              </Box>
              {/* <Trash /> */}
            </DragDropContext>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

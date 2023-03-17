import { useMemo, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Container } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import GridLayout from 'react-grid-layout';
import { DragDropContext, type DropResult } from 'react-beautiful-dnd';
import Bar from './Bar';
import List from './List';
import Trash from './Trash';
import { UrlPlayer, MusicPlayer } from './Player';

export interface Playlist {
  url: string;
  name: string;
  items: PlaylistItems;
}

export type PlaylistItems = Array<{ url: string; title: string }>;

export default function DashboardContent() {
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
  const [url, setUrl] = useState('');
  useEffect(() => {
    (async () => {
      const url = 'https://www.youtube.com/playlist?list=PLT9jUIZQ61i7Tf3t1ai7RqdXLSYFJiPUJ';
      setUrl(url);
    })();
  });
  const [playlists, setPlaylists] = useState([
    {
      url: '1-url',
      name: '1-name',
      items: [
        {
          url: '1-1-url',
          title: '1-1-title',
        },
        {
          url: '1-2-url',
          title: '1-2-title',
        },
        {
          url: '1-3-url',
          title: '1-3-title',
        },
      ],
    },
    {
      url: '2-url',
      name: '2-name',
      items: [
        {
          url: '2-1-url',
          title: '2-1-title',
        },
        {
          url: '2-2-url',
          title: '2-2-title',
        },
        {
          url: '2-3-url',
          title: '2-3-title',
        },
      ],
    },
  ]);

  const reorder = (prev: Array<Playlist>, startIndex: number, startId: number, endIndex: number, endId: number) => {
    const result = prev;
    const [removed] = result[startId].items.splice(startIndex, 1);
    result[endId].items.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // ドロップ先が存在しない場合は終了
    if (!destination) {
      return;
    }
    // 同じ位置に移動した場合は終了
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    if (destination.droppableId === 'trash') {
      setPlaylists((prev) => {
        prev[Number(source.droppableId)].items.splice(source.index, 1);
        return prev;
      });
      return;
    }

    setPlaylists((prev) =>
      reorder(prev, source.index, Number(source.droppableId), destination.index, Number(destination.droppableId))
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Bar />
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
          <Container maxWidth="lg" sx={{ p: 1, mt: '4rem', height: 'calc(100% - 4rem)', position: 'relative' }}>
            <DragDropContext onDragEnd={onDragEnd}>
              <Box display="flex">
                {/* <MusicPlayer url={url} /> */}
                {/* <UrlPlayer /> */}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-evenly', height: '100%' }}>
                {playlists.map((playlist, index) => (
                  <List playlist={playlist} setPlaylists={setPlaylists} index={index} key={playlist.url} />
                ))}
              </Box>
              <Trash />
            </DragDropContext>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

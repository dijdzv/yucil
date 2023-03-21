import { invoke } from '@tauri-apps/api/tauri';
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

export type PlaylistItems = { url: string; title: string }[];

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
  const [urls, setUrls] = useState([""]);

  async function get_playlists() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    const urls: string[] = await invoke('get_playlists');
    setUrls(urls);
  }

  useEffect(() => {
    (async () => {
      await get_playlists();
    })();
  });

  const initialPlaylists: { url: string; name: string; items: { url: string; title: string }[] }[] = [];
  for (let i = 0; i < 2; i++) {
    const playlistIndex = i + 1;
    const playlist: { url: string; name: string; items: { url: string; title: string }[] } = {
      url: `https://example.com/playlist${playlistIndex}`,
      name: `Playlist ${playlistIndex}`,
      items: [],
    };

    for (let j = 0; j < 10; j++) {
      const itemIndex = j + 1;
      playlist.items.push({
        url: `https://example.com/playlist${playlistIndex}/item${itemIndex}`,
        title: `Item ${itemIndex}`,
      });
    }

    initialPlaylists.push(playlist);
  }
  const [playlists, setPlaylists] = useState(initialPlaylists);

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
          <Container
            maxWidth="lg"
            sx={{ p: 1, mt: '4rem', height: 'calc(100% - 4rem)', position: 'relative', display: 'flex' }}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              <MusicPlayer url={urls[0]} />
              {/* <UrlPlayer /> */}
              <Box sx={{ display: 'flex', justifyContent: 'space-evenly', height: '100%' }}>
                {playlists.map((playlist: Playlist, index: number) => (
                  <List playlist={playlist} setPlaylists={setPlaylists} index={index} key={playlist.url} />
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

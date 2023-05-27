import { Dispatch, SetStateAction, useState, useContext } from 'react';
import { styled } from '@mui/material/styles';
import { Box, List, Divider, Toolbar, Typography, Drawer as MuiDrawer, IconButton, Link, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import DeleteIcon from '@mui/icons-material/Delete';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { getName, getVersion } from '@tauri-apps/api/app';
import { Droppable } from 'react-beautiful-dnd';
import { Playlist, TrashContext } from './Dashboard';
import { getPlaylists } from './api';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const drawerWidth: number = 200;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  '& .MuiDrawer-paper': {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: 'border-box',
    ...(!open && {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(7),
      },
    }),
  },
}));

const appName = await getName();
const appVersion = await getVersion();

function Copyright(props: any) {
  return (
    <Typography variant="body2" className="yucil-2" align="right" {...props}>
      {/* {'Copyright © '} */}
      <Link className="yucil-1" href="https://github.com/dijdzv/yucil" target="_blank" sx={{ textDecoration: 'none' }}>
        {appName + ' v' + appVersion}
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

type BarProps = {
  playlists: Playlist[];
  handlePlaylist: (playlist: Playlist, fn?: () => void) => void;
  setPlaylist: Dispatch<SetStateAction<Playlist | undefined>>;
  setPlaylists: Dispatch<SetStateAction<Playlist[]>>;
  handlePlaying: (playing: boolean) => void;
};

export default function Bar(props: BarProps) {
  // TODO: change playlist
  const { playlists, handlePlaylist, setPlaylist, setPlaylists, handlePlaying } = props;

  const reloadPlaylists = () => {
    setPlaylist(undefined);
    handlePlaying(false);
    setTimeout(() => {
      getPlaylists(setPlaylist, setPlaylists);
    }, 200);
  };

  const [open, setOpen] = useState(false);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [trashOpen, setTrashOpen] = useState(false);
  const { trash, setTrash } = useContext(TrashContext);
  const handleTrashClick = () => {
    setTrashOpen((prev) => !prev);
  };

  const handlePlaylistTitleClick = (playlist: Playlist) => {
    // TODO: playlistTitleをクリックしたら、playlistの表示を切り替える
  };

  // TODO: Trashをクリックしたら、Trashに入れた曲を表示する
  // TODO: Trashに入れた曲をplaylistsに戻せるようにする

  return (
    <>
      <AppBar position="absolute" open={open} sx={{ backgroundColor: '#000' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box />
          <Typography component="h1" variant="h6" color="inherit" noWrap>
            <Copyright sx={{}} />
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open} sx={{ zIndex: 1201 }}>
        <List component="nav" sx={{ mx: 1 }}>
          <IconButton color="inherit" onClick={toggleDrawer}>
            <MenuIcon />
          </IconButton>
          <IconButton onClick={reloadPlaylists}>
            <AutorenewIcon />
          </IconButton>
          <IconButton onClick={handleTrashClick}>
            <Droppable droppableId="trash">
              {(provided) => (
                <div ref={provided.innerRef} style={{ height: '24px' }}>
                  <DeleteIcon />
                </div>
              )}
            </Droppable>
          </IconButton>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {playlists.map((playlist) => (
              <Button onClick={() => handlePlaylistTitleClick(playlist)}>
                <Box>{playlist.title}</Box>
              </Button>
            ))}
          </Box>
        </List>
      </Drawer>
      <Box
        sx={{
          bgcolor: 'red',
          width: 300,
          height: 300,
          position: 'absolute',
          top: 50,
          left: 70,
          zIndex: 5000,
          display: trashOpen ? 'block' : 'none',
        }}
      ></Box>
    </>
  );
}

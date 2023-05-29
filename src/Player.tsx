import React, { forwardRef, useImperativeHandle, useRef, useState, Dispatch, SetStateAction } from 'react';
import { Box, Card, CardHeader, CardContent, Divider, IconButton, TextField, Toolbar, Slider } from '@mui/material';
import ReactPlayer from 'react-player/youtube';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RepeatIcon from '@mui/icons-material/Repeat';
import RepeatOneIcon from '@mui/icons-material/RepeatOne';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ReplayIcon from '@mui/icons-material/Replay';
import Forward5Icon from '@mui/icons-material/Forward5';
import Forward10Icon from '@mui/icons-material/Forward10';
import Forward30Icon from '@mui/icons-material/Forward30';
import Replay5Icon from '@mui/icons-material/Replay5';
import Replay10Icon from '@mui/icons-material/Replay10';
import Replay30Icon from '@mui/icons-material/Replay30';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { OnProgressProps } from 'react-player/base';
import { BASE_PLAYLIST_URL, Playlist, Playlists } from './Dashboard';

type MusicPlayerProps = {
  playlists: Playlists;
  setPlaylists: Dispatch<SetStateAction<Playlists>>;
};

export interface MusicPlayerRefHandle {
  handlePlaylistAt(index: number): void;
  handlePlaying(playing?: boolean): void;
  isExist(): boolean;
}

export const MusicPlayer = forwardRef<MusicPlayerRefHandle, MusicPlayerProps>(function MusicPlayer(props, ref) {
  const { playlists, setPlaylists } = props;
  const playlist = playlists.getPlayingPlaylist();

  const playerRef = useRef<ReactPlayer>(null);
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [oneLoop, setOneLoop] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [shuffle, setShuffle] = useState(false);

  const opacity = (condition: boolean): object => ({
    opacity: condition ? 1 : 0.3,
  });

  const timeToMinute = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return minutes + ':' + ('00' + seconds).slice(-2);
  };

  //! FIXME: player側で自動で次に行くとき、setPlaylistを使う

  useImperativeHandle(
    ref,
    () => {
      return {
        // shuffleを考慮する
        handlePlaylistAt(index: number) {
          const player = playerRef.current?.getInternalPlayer();
          if (player === undefined) return;
          const timerId = setInterval(() => {
            if ('playVideoAt' in player) {
              player.playVideoAt(index);
              console.log('handlePlaylistAt: ', index);
              handlePlaying(true);
              clearInterval(timerId);
            }
          }, 100);
        },
        handlePlaying(playing?: boolean) {
          handlePlaying(playing);
        },
        isExist(): boolean {
          return playerRef.current !== null && playerRef.current.getInternalPlayer() !== null;
        },
      };
    },
    []
  );

  const startTimer = () => {
    console.log('startTimer');
    const player = playerRef.current;
    const currentTime = player?.getCurrentTime() || 0;
    const duration = player?.getDuration() || 0;
    setTime({
      current: currentTime,
      duration,
    });
    intervalRef.current = setInterval(() => {
      setTime({
        current: player?.getCurrentTime() || 0,
        duration,
      });
    }, 300);
  };

  const stopTimer = () => {
    console.log('stopTimer');
    clearInterval(intervalRef.current ?? undefined);
    intervalRef.current = null;
  };

  const handleOnReady = () => {
    console.log('handleOnReady');
    stopTimer();
    startTimer();
  };

  const handleOnPlay = () => {
    console.log('handleOnPlay');
    intervalRef.current !== null && stopTimer();
    intervalRef.current === null && startTimer();
  };

  const handleOnProgress = (progress: OnProgressProps) => {
    oneLoop && progress.played > 0.99 && handleReplay();
  };

  const handleOnEnded = () => {
    console.log('handleOnEnded');
    stopTimer();
    handlePlaying(false);
  };

  const handleOnPause = () => {
    console.log('handleOnPause');
    stopTimer();
  };

  const handleTime = (time: number) => {
    playerRef.current?.seekTo(time);
    handlePlaying(true);
  };

  const handleLoop = () => {
    setLoop((prev) => !prev);
  };

  const handleOneLoop = () => {
    setOneLoop((prev) => !prev);
  };

  const handleShuffle = () => {
    playerRef.current?.getInternalPlayer().setShuffle(!shuffle);
    setShuffle((prev) => !prev);
  };

  const handleReplay = () => {
    console.log('handleReplay');
    playerRef.current?.seekTo(0);
  };

  const handlePrevious = () => {
    console.log('handlePrevious');
    const now = playlist.index;
    const previous = now === undefined || now === 0 ? playlist.items.length : now - 1;
    playerRef.current?.getInternalPlayer().playVideoAt(previous);
    setPlaylists((prev) => {
      prev.setPlayingPlaylistIndex(previous);
      return prev.copy();
    });
    handlePlaying(true);
  };

  const handleNext = () => {
    console.log('handleNext');
    const now = playlist?.index;
    const next = now === undefined || now === playlist?.items.length ? 0 : now + 1;
    playerRef.current?.getInternalPlayer().playVideoAt(next);
    setPlaylists((prev) => {
      prev.setPlayingPlaylistIndex(next);
      return prev.copy();
    });
    handlePlaying(true);
  };

  const handlePlaying = (playing?: boolean) => {
    console.log('handlePlaying', playing);
    playing !== undefined ? setPlaying(playing) : setPlaying((prev) => !prev);
  };

  const handleMuted = () => {
    setMuted((prev) => !prev);
  };

  const handleVolume = (volume: number) => {
    setVolume(volume);
  };

  return (
    <Card variant="outlined" sx={{ width: '50%', display: 'flex', flexDirection: 'column' }}>
      <ReactPlayer
        id="music-player"
        ref={playerRef}
        url={playlists.playlistId === undefined ? undefined : BASE_PLAYLIST_URL + playlist.id}
        playing={playing}
        playsinline={true}
        loop={loop}
        volume={volume}
        muted={muted}
        controls={false}
        width={0}
        height={0}
        onReady={handleOnReady}
        onPlay={handleOnPlay}
        onEnded={handleOnEnded}
        onPause={handleOnPause}
        onProgress={(progress) => handleOnProgress(progress)}
      />
      <CardHeader
        title={playlist?.items.at(playlist.index)?.title}
        titleTypographyProps={{
          noWrap: true,
          width: '30vw',
        }}
        subheader={timeToMinute(time.current) + ' / ' + timeToMinute(time.duration)}
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 5 }}>
        <Box display="flex" flexDirection="column" flexGrow={1}>
          <Slider
            color="primary"
            value={time.current}
            min={0}
            max={time.duration}
            onChange={(_, value) => handleTime(value as number)}
            sx={{ flexGrow: 1 }}
          />
          <Slider
            size="small"
            color="secondary"
            value={volume}
            min={0}
            step={0.01}
            max={1}
            onChange={(_, value) => handleVolume(value as number)}
            sx={{ flexGrow: 1 }}
          />
        </Box>
        <Box display="flex" flexDirection="column" flexGrow={1}>
          <Box display={'flex'} flexGrow={1} py={1}>
            <IconButton onClick={handleLoop} sx={{ flexGrow: 1, p: 0 }}>
              <RepeatIcon sx={opacity(loop)} />
            </IconButton>
            <IconButton onClick={handleOneLoop} sx={{ flexGrow: 1, p: 0 }}>
              <RepeatOneIcon sx={opacity(oneLoop)} />
            </IconButton>
            <IconButton onClick={() => handleShuffle()} sx={{ flexGrow: 1, p: 0 }}>
              <ShuffleIcon sx={opacity(shuffle)} />
            </IconButton>
            <IconButton onClick={() => handleReplay()} sx={{ flexGrow: 1, p: 0 }}>
              <ReplayIcon />
            </IconButton>
            <IconButton onClick={() => handlePrevious()} sx={{ flexGrow: 1, p: 0 }}>
              <SkipPreviousIcon />
            </IconButton>
            <IconButton onClick={() => handlePlaying()} sx={{ flexGrow: 1, p: 0 }}>
              {playing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton onClick={() => handleNext()} sx={{ flexGrow: 1, p: 0 }}>
              <SkipNextIcon />
            </IconButton>
            <IconButton onClick={handleMuted} sx={{ flexGrow: 1, p: 0 }}>
              {(muted || volume === 0) && <VolumeOffIcon />}
              {!muted && volume > 0 && volume < 0.5 && <VolumeDownIcon />}
              {!muted && volume >= 0.5 && <VolumeUpIcon />}
            </IconButton>
          </Box>
          <Box display={'flex'} flexGrow={1} py={1}>
            <IconButton onClick={() => handleTime(time.current - 30)} sx={{ flexGrow: 1, p: 0 }}>
              <Replay30Icon />
            </IconButton>
            <IconButton onClick={() => handleTime(time.current - 10)} sx={{ flexGrow: 1, p: 0 }}>
              <Replay10Icon />
            </IconButton>
            <IconButton onClick={() => handleTime(time.current - 5)} sx={{ flexGrow: 1, p: 0 }}>
              <Replay5Icon />
            </IconButton>
            <IconButton onClick={() => handleTime(time.current + 5)} sx={{ flexGrow: 1, p: 0 }}>
              <Forward5Icon />
            </IconButton>
            <IconButton onClick={() => handleTime(time.current + 10)} sx={{ flexGrow: 1, p: 0 }}>
              <Forward10Icon />
            </IconButton>
            <IconButton onClick={() => handleTime(time.current + 30)} sx={{ flexGrow: 1, p: 0 }}>
              <Forward30Icon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

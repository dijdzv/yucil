import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
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
import { BASE_PLAYLIST_URL, Playlist } from './Dashboard';

type MusicPlayerProps = {
  playlist: Playlist | undefined;
};

export interface MusicPlayerRefHandle {
  handlePlaylistAt(index: number): void;
  handlePlaylist(playlist: Playlist, index?: number): void;
}

export const MusicPlayer = forwardRef<MusicPlayerRefHandle, MusicPlayerProps>(function MusicPlayer(props, ref) {
  const { playlist } = props;

  const playerRef = useRef<ReactPlayer>(null);
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [oneLoop, setOneLoop] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [title, setTitle] = useState<string | null | undefined>();
  const [shuffle, setShuffle] = useState(false);

  const opacity = (condition: boolean): object => ({
    opacity: condition ? 1 : 0.3,
  });

  const timeToMinute = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return minutes + ':' + ('00' + seconds).slice(-2);
  };

  useImperativeHandle(
    ref,
    () => {
      return {
        // shuffleを考慮する
        handlePlaylistAt(index: number) {
          playerRef.current?.getInternalPlayer().playVideoAt(index);
          handlePlaying(true);
        },
        handlePlaylist(playlist: Playlist, index?: number) {
          handlePlaying(false);
          playerRef.current?.getInternalPlayer().loadPlaylist({
            list: playlist.id,
            listType: 'playlist',
            index: index ?? 0,
            startSeconds: 0,
            suggestedQuality: 'small',
          });
          handlePlaying(true);
        },
      };
    },
    []
  );

  const startTimer = () => {
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
    clearInterval(intervalRef.current ?? undefined);
    intervalRef.current = null;
  };

  const handleTitle = () => {
    const iframe = document.querySelector('#music-player')?.querySelector('iframe');
    setTitle(iframe?.getAttribute('title'));
  };

  const handleOnReady = () => {
    handleTitle();
    startTimer();
  };

  const handleOnPlay = () => {
    intervalRef.current === null && startTimer();
    handleTitle();
  };

  const handleOnProgress = (progress: OnProgressProps) => {
    oneLoop && progress.played > 0.99 && handleReplay();
  };

  const handleOnEnded = () => {
    stopTimer();
    handlePlaying();
  };

  const handleOnPause = () => {
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
    playerRef.current?.seekTo(0);
  };

  const handlePrevious = () => {
    playerRef.current?.getInternalPlayer().previousVideo();
    handlePlaying(true);
  };

  const handleNext = () => {
    playerRef.current?.getInternalPlayer().nextVideo();
    handlePlaying(true);
  };

  const handlePlaying = (playing?: boolean) => {
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
        url={playlist === undefined ? undefined : BASE_PLAYLIST_URL + playlist.id}
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
        title={title}
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

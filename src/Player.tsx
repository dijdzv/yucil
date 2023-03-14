import { useState, useEffect, useRef } from 'react';
import { Box, IconButton, TextField, Toolbar, Slider, Typography } from '@mui/material';
import ReactPlayer from 'react-player/youtube';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RepeatIcon from '@mui/icons-material/Repeat';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ReplayIcon from '@mui/icons-material/Replay';
import Forward5Icon from '@mui/icons-material/Forward5';
import Forward10Icon from '@mui/icons-material/Forward10';
import Forward30Icon from '@mui/icons-material/Forward30';
import Replay5Icon from '@mui/icons-material/Replay5';
import Replay10Icon from '@mui/icons-material/Replay10';
import Replay30Icon from '@mui/icons-material/Replay30';
import { display } from '@mui/system';

function UrlPlayer() {
  const [url, setUrl] = useState<Array<string>>([]);

  return (
    <Box sx={{ width: '50%', border: '1px solid #555', borderRadius: 1 }}>
      <ReactPlayer url={url} playing={true} volume={0.3} controls={true} width={'100%'} height={250} />
      <Toolbar disableGutters={true}>
        <IconButton
          onClick={() => {
            navigator.clipboard.readText().then((clipText) => {
              ReactPlayer.canPlay(clipText) && setUrl([...url, clipText]);
            });
          }}
        >
          <ContentPasteIcon />
        </IconButton>
        <TextField disabled label="URL..." variant="standard" value={url} fullWidth={true} />
      </Toolbar>
    </Box>
  );
}

function MusicPlayer(props: any) {
  const { url } = props;
  const [playing, setPlaying] = useState(true);
  const [loop, setLoop] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const [openVolume, setOpenVolume] = useState(true);
  const ref = useRef<ReactPlayer>(null);
  const opacity = (condition: boolean): object => ({
    opacity: condition ? 1 : 0.3,
  });

  const initialTime = {
    current: 0,
    duration: 0,
  };
  interface Time {
    current: number;
    duration: number;
  }
  const [time, setTime] = useState<Time>(initialTime);
  const timeToMinute = (time: number): string => {
    return Math.floor(time / 60) + ':' + ('00' + Math.floor(time % 60)).slice(-2);
  };
  const intervalRef = useRef<any>(null);
  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTime({
        current: ref.current?.getCurrentTime() || 0,
        duration: ref.current?.getDuration() || 0,
      });
    }, 500);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  return (
    <Box sx={{ width: '50%', border: '1px solid #555', borderRadius: 1 }}>
      <ReactPlayer
        ref={ref}
        url={url}
        playing={playing}
        loop={loop}
        volume={volume}
        controls={false}
        width={'100%'}
        height={250}
        onPlay={startTimer}
        onEnded={stopTimer}
        onPause={stopTimer}
      />
      <Slider
        size="small"
        color="primary"
        value={time.current}
        min={0}
        max={time.duration}
        onChange={(_, value) => ref.current?.seekTo(value as number)}
      />
      <Toolbar disableGutters={true}>
        <IconButton onClick={() => setLoop(!loop)}>
          <RepeatIcon sx={opacity(loop)} />
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(0, 'fraction')}>
          <ReplayIcon />
        </IconButton>
        <IconButton onClick={() => setPlaying(!playing)}>{playing ? <PauseIcon /> : <PlayArrowIcon />}</IconButton>
        <IconButton onClick={() => ref.current?.seekTo(1, 'fraction')}>
          <SkipNextIcon />
        </IconButton>
        <IconButton onClick={() => setOpenVolume(!openVolume)}>
          {volume === 0 && <VolumeOffIcon sx={opacity(openVolume)} />}
          {volume > 0 && volume < 0.5 && <VolumeDownIcon sx={opacity(openVolume)} />}
          {volume >= 0.5 && <VolumeUpIcon sx={opacity(openVolume)} />}
        </IconButton>
        {openVolume && (
          <Slider
            size="small"
            color="secondary"
            value={volume}
            min={0}
            step={0.01}
            max={1}
            onChange={(_, value) => {
              setVolume(value as number);
            }}
          />
        )}
      </Toolbar>
      <Toolbar disableGutters={true}>
        <IconButton onClick={() => ref.current?.seekTo(time.current - 5)}>
          <Replay5Icon />
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(time.current - 10)}>
          <Replay10Icon />
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(time.current - 30)}>
          <Replay30Icon />
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(time.current + 5)}>
          <Forward5Icon />
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(time.current + 10)}>
          <Forward10Icon />
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(time.current + 30)}>
          <Forward30Icon />
        </IconButton>
        <Typography sx={{ fontSize: '0.75rem', opacity: '0.8' }}>
          {timeToMinute(time.current)} / {timeToMinute(time.duration)}
        </Typography>
      </Toolbar>
    </Box>
  );
}

export { UrlPlayer, MusicPlayer };

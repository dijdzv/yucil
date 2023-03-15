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
  const [muted, setMuted] = useState(false);
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

  const [title, setTitle] = useState<string | null | undefined>();
  const getTitle = () => {
    setTitle(document.querySelector('#music-player')?.querySelector('iframe')?.getAttribute('title'));
  };

  return (
    <Box sx={{ width: '50%', border: '1px solid #555', borderRadius: 1 }}>
      <ReactPlayer
        id="music-player"
        ref={ref}
        url={url}
        playing={playing}
        loop={loop}
        volume={volume}
        muted={muted}
        controls={false}
        width={0}
        height={0}
        onPlay={() => (startTimer(), getTitle())}
        onEnded={stopTimer}
        onPause={stopTimer}
      />
      <Toolbar>
        <Typography component="h1" variant="h6" color="inherit" noWrap width="80%">
          {title}
        </Typography>
        <Typography variant="caption" noWrap sx={{ opacity: '0.8' }}>
          {timeToMinute(time.current)} / {timeToMinute(time.duration)}
        </Typography>
      </Toolbar>
      <Toolbar>
        <Slider
          size="medium"
          color="primary"
          value={time.current}
          min={0}
          max={time.duration}
          onChange={(_, value) => ref.current?.seekTo(value as number)}
        />
      </Toolbar>
      <Toolbar>
        <IconButton onClick={() => setLoop(!loop)}>
          <RepeatIcon sx={opacity(loop)} fontSize="large" />
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(0, 'fraction')}>
          <ReplayIcon fontSize="large" />
        </IconButton>
        <IconButton onClick={() => setPlaying(!playing)}>
          {playing ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(1, 'fraction')}>
          <SkipNextIcon fontSize="large" />
        </IconButton>
        <IconButton onClick={() => setMuted(!muted)}>
          {(muted || volume === 0) && <VolumeOffIcon fontSize="large" />}
          {!muted && volume > 0 && volume < 0.5 && <VolumeDownIcon fontSize="large" />}
          {!muted && volume >= 0.5 && <VolumeUpIcon fontSize="large" />}
        </IconButton>
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
      </Toolbar>
      <Toolbar>
        <IconButton onClick={() => ref.current?.seekTo(time.current - 30)} sx={{ flexGrow: 1 }}>
          <Replay30Icon fontSize="large" />
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(time.current - 10)} sx={{ flexGrow: 1 }}>
          <Replay10Icon fontSize="large" />
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(time.current - 5)} sx={{ flexGrow: 1 }}>
          <Replay5Icon fontSize="large" />
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(time.current + 5)} sx={{ flexGrow: 1 }}>
          <Forward5Icon fontSize="large" />
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(time.current + 10)} sx={{ flexGrow: 1 }}>
          <Forward10Icon fontSize="large" />
        </IconButton>
        <IconButton onClick={() => ref.current?.seekTo(time.current + 30)} sx={{ flexGrow: 1 }}>
          <Forward30Icon fontSize="large" />
        </IconButton>
      </Toolbar>
    </Box>
  );
}

export { UrlPlayer, MusicPlayer };

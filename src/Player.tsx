import { useState, useRef } from 'react';
import { Box, IconButton, TextField, Toolbar, Slider, Typography } from '@mui/material';
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
  //? playlistをapiから取得してきたplaylistから動画単体ずつで制御する
  const { url } = props;

  const [playing, setPlaying] = useState(true);
  const [loop, setLoop] = useState(true);
  const [oneLoop, setOneLoop] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [title, setTitle] = useState<string | null | undefined>();
  const [shuffle, setShuffle] = useState(false);

  const intervalRef = useRef<any>(null);
  const ref = useRef<ReactPlayer>(null);

  const opacity = (condition: boolean): object => ({
    opacity: condition ? 1 : 0.3,
  });

  const timeToMinute = (time: number): string => {
    return Math.floor(time / 60) + ':' + ('00' + Math.floor(time % 60)).slice(-2);
  };

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

  const handleTitle = () => {
    setTitle(document.querySelector('#music-player')?.querySelector('iframe')?.getAttribute('title'));
  };

  const handleOnPlay = () => {
    startTimer();
    handleTitle();
  };

  const handleOnEnded = () => {
    stopTimer();
  };

  const handleOnPause = () => {
    stopTimer();
  };

  const handleTime = (value: number) => {
    ref.current?.seekTo(value);
    handlePlaying(true);
  };

  const handleLoop = () => {
    setLoop((prev) => !prev);
  };

  const handleOneLoop = () => {
    setOneLoop((prev) => !prev);
  };

  const handleShuffle = () => {
    ref.current?.getInternalPlayer().setShuffle(!shuffle);
    setShuffle((prev) => !prev);
  };

  const handleReplay = () => {
    ref.current?.seekTo(0, 'fraction');
  };

  const handlePrevious = () => {
    ref.current?.getInternalPlayer().previousVideo();
    handlePlaying(true);
  };

  const handleNext = () => {
    ref.current?.getInternalPlayer().nextVideo();
    handlePlaying(true);
  };

  const handlePlaying = (playing?: boolean) => {
    playing ? setPlaying(playing) : setPlaying((prev) => !prev);
  };

  const handelMuted = () => {
    setMuted((prev) => !prev);
  };

  const handleVolume = (value: number) => {
    setVolume(value);
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
        onPlay={handleOnPlay}
        onEnded={handleOnEnded}
        onPause={handleOnPause}
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
          color="primary"
          value={time.current}
          min={0}
          max={time.duration}
          onChange={(_, value) => handleTime(value as number)}
        />
      </Toolbar>
      <Toolbar>
        <IconButton onClick={handleLoop}>
          <RepeatIcon sx={opacity(loop)} />
        </IconButton>
        <IconButton onClick={handleOneLoop}>
          <RepeatOneIcon sx={opacity(oneLoop)} />
        </IconButton>
        <IconButton onClick={() => handleShuffle()}>
          <ShuffleIcon sx={opacity(shuffle)} />
        </IconButton>
        <IconButton onClick={() => handleReplay()}>
          <ReplayIcon />
        </IconButton>
        <IconButton onClick={() => handlePrevious()}>
          <SkipPreviousIcon />
        </IconButton>
        <IconButton onClick={() => handlePlaying()}>{playing ? <PauseIcon /> : <PlayArrowIcon />}</IconButton>
        <IconButton onClick={() => handleNext()}>
          <SkipNextIcon />
        </IconButton>
        <IconButton onClick={handelMuted}>
          {(muted || volume === 0) && <VolumeOffIcon />}
          {!muted && volume > 0 && volume < 0.5 && <VolumeDownIcon />}
          {!muted && volume >= 0.5 && <VolumeUpIcon />}
        </IconButton>
        <Slider
          size="small"
          color="secondary"
          value={volume}
          min={0}
          step={0.01}
          max={1}
          onChange={(_, value) => handleVolume(value as number)}
        />
      </Toolbar>
      <Toolbar>
        <IconButton onClick={() => handleTime(time.current - 30)} sx={{ flexGrow: 1 }}>
          <Replay30Icon />
        </IconButton>
        <IconButton onClick={() => handleTime(time.current - 10)} sx={{ flexGrow: 1 }}>
          <Replay10Icon />
        </IconButton>
        <IconButton onClick={() => handleTime(time.current - 5)} sx={{ flexGrow: 1 }}>
          <Replay5Icon />
        </IconButton>
        <IconButton onClick={() => handleTime(time.current + 5)} sx={{ flexGrow: 1 }}>
          <Forward5Icon />
        </IconButton>
        <IconButton onClick={() => handleTime(time.current + 10)} sx={{ flexGrow: 1 }}>
          <Forward10Icon />
        </IconButton>
        <IconButton onClick={() => handleTime(time.current + 30)} sx={{ flexGrow: 1 }}>
          <Forward30Icon />
        </IconButton>
      </Toolbar>
    </Box>
  );
}

export { UrlPlayer, MusicPlayer };

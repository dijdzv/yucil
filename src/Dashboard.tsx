import { useMemo, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, Container, Grid, Paper, Typography, Toolbar } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import ReactPlayer from 'react-player/youtube';
import { Bar } from './Bar';
import Lists from './List';
import { UrlPlayer, MusicPlayer } from './Player';

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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Bar />
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              mt: '6rem',
              height: 'calc(100% - 6rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box display="flex">
              <MusicPlayer url={url} />
              <UrlPlayer />
            </Box>
            <Lists />

            {/* <Grid container spacing={3}>
              /* Chart
              <Grid item xs={12} md={8} lg={9}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 240,
                  }}
                >
                  <Chart />
                </Paper>
              </Grid>
              Recent Deposits
              <Grid item xs={12} md={4} lg={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 240,
                  }}
                >
                  <Deposits />
                </Paper>
              </Grid>
              Recent Orders
              <Grid item xs={12}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Orders />
                </Paper>
              </Grid>
                </Grid> */}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

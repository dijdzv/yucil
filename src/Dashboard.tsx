import { useMemo, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box,
  CssBaseline,
  Container,
  Grid,
  Link,
  Paper,
  Typography,
  Toolbar,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import ReactPlayer from 'react-player/youtube';
import { getName, getVersion } from '@tauri-apps/api/app';
import { Bar } from './Bar';
import Lists from './List';

const appName = await getName();
const appVersion = await getVersion();

function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {'Copyright © '}
      <Link
        color="inherit"
        href="https://github.com/dijdzv/yucil"
        target="_blank"
      >
        {appName + ' v' + appVersion}
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

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
      const url =
        'https://www.youtube.com/watch?v=XPUN-w543bc&list=RDXPUN-w543bc&start_radio=1';
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
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
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
            <ReactPlayer url={url} controls={true} loop={true} />
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
            <Copyright sx={{ mb: 2 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

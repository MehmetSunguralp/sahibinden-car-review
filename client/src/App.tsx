import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  IconButton,
  InputAdornment,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  createTheme,
  useMediaQuery,
} from '@mui/material'
import { DarkMode, LightMode, Search } from '@mui/icons-material'
import { motion } from 'framer-motion'
import axios from 'axios'
import type { PaletteMode } from '@mui/material'
import './styles/App.scss'

type AnalysisResponse = {
  ad: {
    adNo: string
    id: string | null
    title: string | null
    coverImageUrl: string | null
    url: string
  }
  analysis: unknown
}

const primaryYellow = '#FFE800'
const gray = '#3F475F'
const offWhite = '#F2F2F2'
const white = '#FFFFFF'

function App() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = useState<PaletteMode>(prefersDark ? 'dark' : 'light')
  const [adNo, setAdNo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResponse | null>(null)

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: primaryYellow,
          },
          secondary: {
            main: gray,
          },
          background: {
            default: mode === 'dark' ? '#050711' : offWhite,
            paper: mode === 'dark' ? '#101322' : white,
          },
          text: {
            primary: mode === 'dark' ? white : '#111827',
            secondary: mode === 'dark' ? '#e5e7eb' : '#4b5563',
          },
        },
        typography: {
          fontFamily:
            '"Hanken Grotesk", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        shape: {
          borderRadius: 14,
        },
      }),
    [mode],
  )

  const handleToggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleSubmit = async () => {
    const trimmed = adNo.trim()
    if (!trimmed) {
      setError('Lütfen bir ilan numarası girin.')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)

    try {
      const response = await axios.get<AnalysisResponse>(
        `http://localhost:3000/`,
        {
          params: { adNo: trimmed },
        },
      )
      setResult(response.data)
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Beklenmeyen bir hata oluştu.'
      setError(
        typeof message === 'string'
          ? message
          : 'İstek sırasında bir hata oluştu.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          background: mode === 'dark'
            ? 'radial-gradient(circle at top left, rgba(255,232,0,0.12), transparent 55%), radial-gradient(circle at bottom right, rgba(63,71,95,0.6), #050711)'
            : 'radial-gradient(circle at top left, rgba(255,232,0,0.4), #ffffff)',
          transition: 'background 300ms ease',
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 6,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ width: '100%' }}
          >
            <Box
              sx={{
                position: 'relative',
                bgcolor: 'background.paper',
                boxShadow:
                  mode === 'dark'
                    ? '0 24px 80px rgba(0,0,0,0.65)'
                    : '0 20px 60px rgba(15,23,42,0.18)',
                borderRadius: 4,
                px: { xs: 3, sm: 5 },
                py: { xs: 4, sm: 5 },
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background:
                    mode === 'dark'
                      ? 'radial-gradient(circle at top right, rgba(255,232,0,0.16), transparent 55%)'
                      : 'radial-gradient(circle at top right, rgba(255,232,0,0.2), transparent 50%)',
                  opacity: 0.9,
                }}
              />

              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      letterSpacing: '.18em',
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      fontSize: 11,
                    }}
                  >
                    sahibinden car review
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mt: 0.5,
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 1,
                    }}
                  >
                    Yapay Zeka ile
                    <Box component="span" sx={{ color: primaryYellow }}>
                      Ekspertiz
                    </Box>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: 'text.secondary', maxWidth: 420 }}
                  >
                    Sahibinden ilan numarasını gir, aracı tarayıcıda açıp
                    teknik verileri çıkaralım ve Groq tabanlı yapay zeka ile
                    detaylı ekspertiz raporu hazırlayalım.
                  </Typography>
                </Box>

                <Tooltip
                  title={mode === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
                >
                  <IconButton
                    onClick={handleToggleTheme}
                    sx={{
                      bgcolor:
                        mode === 'dark'
                          ? 'rgba(15,23,42,0.8)'
                          : 'rgba(15,23,42,0.04)',
                      borderRadius: 999,
                    }}
                  >
                    {mode === 'dark' ? (
                      <LightMode sx={{ color: primaryYellow }} />
                    ) : (
                      <DarkMode sx={{ color: gray }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: { xs: 'stretch', sm: 'center' },
                }}
              >
                <TextField
                  fullWidth
                  label="İlan numarası"
                  placeholder="Örn: 1304251115"
                  value={adNo}
                  onChange={(e) => setAdNo(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search
                          sx={{
                            color: 'text.secondary',
                            fontSize: 20,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <motion.div
                  whileHover={
                    loading
                      ? {}
                      : { y: -2, boxShadow: '0 14px 30px rgba(0,0,0,0.35)' }
                  }
                  whileTap={loading ? {} : { scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                      whiteSpace: 'nowrap',
                      minWidth: 220,
                      py: 1.4,
                      px: 3,
                      fontWeight: 600,
                      letterSpacing: 0.3,
                      borderRadius: 999,
                      textTransform: 'none',
                      fontSize: 15,
                      background:
                        'linear-gradient(120deg, #FFE800, #facc15, #f97316)',
                      color: '#111827',
                      '&:hover': {
                        background:
                          'linear-gradient(120deg, #fde047, #eab308, #ea580c)',
                      },
                    }}
                  >
                    {loading ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <CircularProgress
                          size={20}
                          sx={{ color: '#111827' }}
                        />
                        <span>Yapay zeka analiz ediyor…</span>
                      </Box>
                    ) : (
                      'Yapay zeka ile ekspertiz yap'
                    )}
                  </Button>
                </motion.div>
              </Box>

              {error && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ mt: 2.5, position: 'relative' }}
                >
                  {error}
                </Typography>
              )}

              {result && (
                <Box
                  sx={{
                    mt: 3,
                    position: 'relative',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor:
                      mode === 'dark'
                        ? 'rgba(148,163,184,0.45)'
                        : 'rgba(148,163,184,0.6)',
                    p: 2.2,
                    backgroundColor:
                      mode === 'dark'
                        ? 'rgba(15,23,42,0.75)'
                        : 'rgba(248,250,252,0.9)',
                    maxHeight: 420,
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: 'text.secondary' }}
                  >
                    Ham JSON yanıtı (geçici gösterim)
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco',
                      fontSize: 12.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {JSON.stringify(result, null, 2)}
                  </Box>
                </Box>
              )}
            </Box>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App

import { NextResponse } from 'next/server';

// Curated Spotify Playlists for Study, Deep Work & Relaxation
export const SPOTIFY_CURATED_PLAYLISTS = [
  {
    id: '37i9dQZF1DX4sWSpwq3LiO',
    title: '🎹 Peaceful Piano',
    category: 'piano',
    description: 'Tiếng đàn dương cầm tĩnh lặng giải tỏa áp lực, tập trung học tập',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwq3LiO?utm_source=generator&theme=0&autoplay=1',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO',
    icon: '🎹',
  },
  {
    id: '37i9dQZF1DXdLEN7aqioXM',
    title: '🌿 Lofi Beats',
    category: 'lofi',
    description: 'Nhạc Lo-fi số 1 thế giới để học tập và thư giãn',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DXdLEN7aqioXM?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM',
    icon: '🌿',
  },
  {
    id: '37i9dQZF1DX8Uebhn9wzrS',
    title: '☕ Chill Lofi Study',
    category: 'study',
    description: 'Giai điệu êm dịu, tăng khả năng ghi nhớ khi học tiếng Anh',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS',
    icon: '☕',
  },
  {
    id: '37i9dQZF1DWZeKCadgRdKQ',
    title: '🌌 Deep Focus',
    category: 'focus',
    description: 'Âm nhạc sóng não Ambient giúp tập trung sâu 30 phút',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ',
    icon: '🌌',
  },
  {
    id: '37i9dQZF1DX0sm0LYsmbMT',
    title: '🎷 Jazz in the Background',
    category: 'jazz',
    description: 'Không gian quán cà phê ấm cúng phong cách vintage',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX0sm0LYsmbMT?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX0sm0LYsmbMT',
    icon: '🎷',
  },
  {
    id: '37i9dQZF1DX3qCx5tlGcyb',
    title: '🌧️ Rain Sounds & White Noise',
    category: 'nature',
    description: 'Tiếng mưa rơi thư giãn và tiếng ồn trắng tập trung',
    embedUrl: 'https://open.spotify.com/embed/playlist/37i9dQZF1DX3qCx5tlGcyb?utm_source=generator&theme=0',
    spotifyUrl: 'https://open.spotify.com/playlist/37i9dQZF1DX3qCx5tlGcyb',
    icon: '🌧️',
  },
];

/**
 * Spotify Web API Proxy / Curated Endpoint
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'curated';
  const query = searchParams.get('q');

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  // If credentials exist and user searched something, query official Spotify Web API
  if (clientId && clientSecret && action === 'search' && query) {
    try {
      const authRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      });
      const authData = await authRes.json();
      const token = authData.access_token;

      if (token) {
        const searchRes = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist,track&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const searchData = await searchRes.json();
        return NextResponse.json({
          success: true,
          playlists: searchData.playlists?.items || [],
          tracks: searchData.tracks?.items || [],
        });
      }
    } catch (err) {
      console.error('Spotify API Token Error:', err);
    }
  }

  // Fallback / Default: Return curated Spotify study playlists
  return NextResponse.json({
    success: true,
    playlists: SPOTIFY_CURATED_PLAYLISTS,
  });
}

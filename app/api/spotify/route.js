import { NextResponse } from 'next/server';
import { SPOTIFY_CURATED_PLAYLISTS } from '@/lib/spotifyData';

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

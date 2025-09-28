import type { LobbyPlayer, LobbySnapshot } from '../types';

const SAMPLE_NAMES = [
  'ماهر الشامي',
  'لمى الخطيب',
  'ليث الحلبي',
  'نور الهادي',
  'تالا دمشق',
  'يزن السالم',
  'رنا الرفاعي',
  'فارس المقداد',
  'سارة حداد',
  'تيمور شاهين'
];

const COUNTRIES = ['SY', 'AE', 'SA', 'QA', 'JO', 'EG'];

function generatePlayer(index: number): LobbyPlayer {
  return {
    id: `player-${index}`,
    username: SAMPLE_NAMES[index % SAMPLE_NAMES.length],
    rating: 1500 + Math.floor(Math.random() * 600),
    country: COUNTRIES[index % COUNTRIES.length],
    streak: Math.floor(Math.random() * 5),
    isPlaying: Math.random() > 0.5
  };
}

export function createMockLobbySnapshot(basePlayers?: LobbyPlayer[]): LobbySnapshot {
  const players = basePlayers ?? Array.from({ length: 8 }, (_, index) => generatePlayer(index));
  const shuffled = players.map((player) => ({
    ...player,
    rating: Math.max(800, player.rating + Math.floor(Math.random() * 60 - 30)),
    isPlaying: Math.random() > 0.4,
    streak: Math.max(0, player.streak + Math.floor(Math.random() * 3 - 1))
  }));

  const activeGames = shuffled.filter((player) => player.isPlaying).length;
  const averageRating = Math.round(
    shuffled.reduce((total, player) => total + player.rating, 0) / shuffled.length
  );

  return {
    summary: {
      totalPlayers: shuffled.length,
      activeGames,
      averageRating
    },
    players: shuffled,
    updatedAt: Date.now()
  };
}

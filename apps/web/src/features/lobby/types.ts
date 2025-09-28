export interface LobbyPlayer {
  id: string;
  username: string;
  rating: number;
  country: string;
  streak: number;
  isPlaying: boolean;
}

export interface LobbySummary {
  totalPlayers: number;
  activeGames: number;
  averageRating: number;
}

export interface LobbySnapshot {
  summary: LobbySummary;
  players: LobbyPlayer[];
  updatedAt: number;
}

export type QueueStatus = 'idle' | 'joining' | 'queued' | 'leaving';

export async function joinQueue(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 800));
}

export async function leaveQueue(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500));
}

export interface QuickMatchResponse {
  matchId: string;
  preferredRatingRange: [number, number];
}

export async function requestQuickMatch(): Promise<QuickMatchResponse>
export async function requestQuickMatch(preferredRatingRange: [number, number]): Promise<QuickMatchResponse>
export async function requestQuickMatch(preferredRatingRange?: [number, number]): Promise<QuickMatchResponse> {
  await new Promise((resolve) => setTimeout(resolve, 650));
  return {
    matchId: `mock-match-${Math.floor(Math.random() * 10000)}`,
    preferredRatingRange: preferredRatingRange ?? [1200, 2000]
  };
}

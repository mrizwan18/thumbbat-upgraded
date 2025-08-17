// types/realtime.ts
export interface Snapshot {
    inning: 1 | 2;
    battingId: string;
    bowlingId: string;
    scores: Record<string, number>;
    firstInningScore: number | null;
    secondInningStarted: boolean;
    target: number | null;
    gameOver: boolean;
    winnerId: string | null;
  }
  
  export interface RoundStartPayload {
    roomId: string;
    round: number;
    deadlineAt: number; // epoch ms
    snapshot: Snapshot;
  }
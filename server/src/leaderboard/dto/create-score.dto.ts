export class CreateScoreDto {
  worldId!: number;
  mapId!: number;
  isInfinite!: boolean;
  wave!: number;
  kills!: number;
  score?: number;
}

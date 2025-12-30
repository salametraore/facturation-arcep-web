
export class Direction {
  readonly id!: number;          // readOnly
  libelle!: string;              // maxLength: 200
  type_direction!: number;       // integer (FK)
}

export type DirectionRequest = Omit<Direction, 'id'>;

export function toDirectionRequest(d: Direction): DirectionRequest {
  const { id, ...payload } = d as any;
  return payload as DirectionRequest;
}

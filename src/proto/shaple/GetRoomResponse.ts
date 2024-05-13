// Original file: src/proto/sbai.proto

import type {
  Turn as _shaple_Turn,
  Turn__Output as _shaple_Turn__Output,
} from '../shaple/Turn';

export interface GetRoomResponse {
  history?: _shaple_Turn[];
}

export interface GetRoomResponse__Output {
  history: _shaple_Turn__Output[];
}

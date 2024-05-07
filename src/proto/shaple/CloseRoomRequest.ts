// Original file: src/proto/sbai.proto

import type { Long } from '@grpc/proto-loader';

export interface CloseRoomRequest {
  roomId?: number | string | Long;
}

export interface CloseRoomRequest__Output {
  roomId: number;
}

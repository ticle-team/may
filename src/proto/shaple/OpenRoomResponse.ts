// Original file: src/proto/sbai.proto

import type { Long } from '@grpc/proto-loader';

export interface OpenRoomResponse {
  'roomId'?: (number | string | Long);
}

export interface OpenRoomResponse__Output {
  'roomId': (string);
}

// Original file: src/proto/sbai.proto

import type { Long } from '@grpc/proto-loader';

export interface GetRoomRequest {
  'roomId'?: (number | string | Long);
}

export interface GetRoomRequest__Output {
  'roomId': (number);
}

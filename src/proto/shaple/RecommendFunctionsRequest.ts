// Original file: src/proto/sbai.proto

import type { Long } from '@grpc/proto-loader';

export interface RecommendFunctionsRequest {
  'roomId'?: (number | string | Long);
  'userInput'?: (string);
}

export interface RecommendFunctionsRequest__Output {
  'roomId': (number);
  'userInput': (string);
}

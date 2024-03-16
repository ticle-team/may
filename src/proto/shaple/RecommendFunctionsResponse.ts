// Original file: src/proto/sbai.proto

import type { RecommendFunctionsSummary as _shaple_RecommendFunctionsSummary, RecommendFunctionsSummary__Output as _shaple_RecommendFunctionsSummary__Output } from '../shaple/RecommendFunctionsSummary';
import type { Long } from '@grpc/proto-loader';

export interface _shaple_RecommendFunctionsResponse_Detail {
  'seqNum'?: (number | string | Long);
  'chunk'?: (string);
}

export interface _shaple_RecommendFunctionsResponse_Detail__Output {
  'seqNum': (number);
  'chunk': (string);
}

export interface RecommendFunctionsResponse {
  'detail'?: (_shaple_RecommendFunctionsResponse_Detail | null);
  'summary'?: (_shaple_RecommendFunctionsSummary | null);
  'body'?: "detail"|"summary";
}

export interface RecommendFunctionsResponse__Output {
  'detail'?: (_shaple_RecommendFunctionsResponse_Detail__Output | null);
  'summary'?: (_shaple_RecommendFunctionsSummary__Output | null);
  'body': "detail"|"summary";
}

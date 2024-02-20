// Original file: src/proto/sbai.proto

import type { RecommendFunctionsSummary as _shaple_RecommendFunctionsSummary, RecommendFunctionsSummary__Output as _shaple_RecommendFunctionsSummary__Output } from '../shaple/RecommendFunctionsSummary';
import type { Long } from '@grpc/proto-loader';

export interface Turn {
  'turnId'?: (number | string | Long);
  'userInput'?: (string);
  'botAnswer'?: (string);
  'recommendFunctionsSummary'?: (_shaple_RecommendFunctionsSummary | null);
}

export interface Turn__Output {
  'turnId': (string);
  'userInput': (string);
  'botAnswer': (string);
  'recommendFunctionsSummary': (_shaple_RecommendFunctionsSummary__Output | null);
}

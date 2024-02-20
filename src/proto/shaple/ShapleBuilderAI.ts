// Original file: src/proto/sbai.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { CloseRoomRequest as _shaple_CloseRoomRequest, CloseRoomRequest__Output as _shaple_CloseRoomRequest__Output } from '../shaple/CloseRoomRequest';
import type { CloseRoomResponse as _shaple_CloseRoomResponse, CloseRoomResponse__Output as _shaple_CloseRoomResponse__Output } from '../shaple/CloseRoomResponse';
import type { GetRoomRequest as _shaple_GetRoomRequest, GetRoomRequest__Output as _shaple_GetRoomRequest__Output } from '../shaple/GetRoomRequest';
import type { GetRoomResponse as _shaple_GetRoomResponse, GetRoomResponse__Output as _shaple_GetRoomResponse__Output } from '../shaple/GetRoomResponse';
import type { OpenRoomRequest as _shaple_OpenRoomRequest, OpenRoomRequest__Output as _shaple_OpenRoomRequest__Output } from '../shaple/OpenRoomRequest';
import type { OpenRoomResponse as _shaple_OpenRoomResponse, OpenRoomResponse__Output as _shaple_OpenRoomResponse__Output } from '../shaple/OpenRoomResponse';
import type { PublishFeedRequest as _shaple_PublishFeedRequest, PublishFeedRequest__Output as _shaple_PublishFeedRequest__Output } from '../shaple/PublishFeedRequest';
import type { PublishFeedResponse as _shaple_PublishFeedResponse, PublishFeedResponse__Output as _shaple_PublishFeedResponse__Output } from '../shaple/PublishFeedResponse';
import type { RecommendFunctionsRequest as _shaple_RecommendFunctionsRequest, RecommendFunctionsRequest__Output as _shaple_RecommendFunctionsRequest__Output } from '../shaple/RecommendFunctionsRequest';
import type { RecommendFunctionsResponse as _shaple_RecommendFunctionsResponse, RecommendFunctionsResponse__Output as _shaple_RecommendFunctionsResponse__Output } from '../shaple/RecommendFunctionsResponse';

export interface ShapleBuilderAIClient extends grpc.Client {
  CloseRoom(argument: _shaple_CloseRoomRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_CloseRoomResponse__Output>): grpc.ClientUnaryCall;
  CloseRoom(argument: _shaple_CloseRoomRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_shaple_CloseRoomResponse__Output>): grpc.ClientUnaryCall;
  CloseRoom(argument: _shaple_CloseRoomRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_CloseRoomResponse__Output>): grpc.ClientUnaryCall;
  CloseRoom(argument: _shaple_CloseRoomRequest, callback: grpc.requestCallback<_shaple_CloseRoomResponse__Output>): grpc.ClientUnaryCall;
  closeRoom(argument: _shaple_CloseRoomRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_CloseRoomResponse__Output>): grpc.ClientUnaryCall;
  closeRoom(argument: _shaple_CloseRoomRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_shaple_CloseRoomResponse__Output>): grpc.ClientUnaryCall;
  closeRoom(argument: _shaple_CloseRoomRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_CloseRoomResponse__Output>): grpc.ClientUnaryCall;
  closeRoom(argument: _shaple_CloseRoomRequest, callback: grpc.requestCallback<_shaple_CloseRoomResponse__Output>): grpc.ClientUnaryCall;
  
  GetRoom(argument: _shaple_GetRoomRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_GetRoomResponse__Output>): grpc.ClientUnaryCall;
  GetRoom(argument: _shaple_GetRoomRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_shaple_GetRoomResponse__Output>): grpc.ClientUnaryCall;
  GetRoom(argument: _shaple_GetRoomRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_GetRoomResponse__Output>): grpc.ClientUnaryCall;
  GetRoom(argument: _shaple_GetRoomRequest, callback: grpc.requestCallback<_shaple_GetRoomResponse__Output>): grpc.ClientUnaryCall;
  getRoom(argument: _shaple_GetRoomRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_GetRoomResponse__Output>): grpc.ClientUnaryCall;
  getRoom(argument: _shaple_GetRoomRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_shaple_GetRoomResponse__Output>): grpc.ClientUnaryCall;
  getRoom(argument: _shaple_GetRoomRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_GetRoomResponse__Output>): grpc.ClientUnaryCall;
  getRoom(argument: _shaple_GetRoomRequest, callback: grpc.requestCallback<_shaple_GetRoomResponse__Output>): grpc.ClientUnaryCall;
  
  OpenRoom(argument: _shaple_OpenRoomRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_OpenRoomResponse__Output>): grpc.ClientUnaryCall;
  OpenRoom(argument: _shaple_OpenRoomRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_shaple_OpenRoomResponse__Output>): grpc.ClientUnaryCall;
  OpenRoom(argument: _shaple_OpenRoomRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_OpenRoomResponse__Output>): grpc.ClientUnaryCall;
  OpenRoom(argument: _shaple_OpenRoomRequest, callback: grpc.requestCallback<_shaple_OpenRoomResponse__Output>): grpc.ClientUnaryCall;
  openRoom(argument: _shaple_OpenRoomRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_OpenRoomResponse__Output>): grpc.ClientUnaryCall;
  openRoom(argument: _shaple_OpenRoomRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_shaple_OpenRoomResponse__Output>): grpc.ClientUnaryCall;
  openRoom(argument: _shaple_OpenRoomRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_OpenRoomResponse__Output>): grpc.ClientUnaryCall;
  openRoom(argument: _shaple_OpenRoomRequest, callback: grpc.requestCallback<_shaple_OpenRoomResponse__Output>): grpc.ClientUnaryCall;
  
  PublishFeed(argument: _shaple_PublishFeedRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_PublishFeedResponse__Output>): grpc.ClientUnaryCall;
  PublishFeed(argument: _shaple_PublishFeedRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_shaple_PublishFeedResponse__Output>): grpc.ClientUnaryCall;
  PublishFeed(argument: _shaple_PublishFeedRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_PublishFeedResponse__Output>): grpc.ClientUnaryCall;
  PublishFeed(argument: _shaple_PublishFeedRequest, callback: grpc.requestCallback<_shaple_PublishFeedResponse__Output>): grpc.ClientUnaryCall;
  publishFeed(argument: _shaple_PublishFeedRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_PublishFeedResponse__Output>): grpc.ClientUnaryCall;
  publishFeed(argument: _shaple_PublishFeedRequest, metadata: grpc.Metadata, callback: grpc.requestCallback<_shaple_PublishFeedResponse__Output>): grpc.ClientUnaryCall;
  publishFeed(argument: _shaple_PublishFeedRequest, options: grpc.CallOptions, callback: grpc.requestCallback<_shaple_PublishFeedResponse__Output>): grpc.ClientUnaryCall;
  publishFeed(argument: _shaple_PublishFeedRequest, callback: grpc.requestCallback<_shaple_PublishFeedResponse__Output>): grpc.ClientUnaryCall;
  
  RecommendFunctions(argument: _shaple_RecommendFunctionsRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_shaple_RecommendFunctionsResponse__Output>;
  RecommendFunctions(argument: _shaple_RecommendFunctionsRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_shaple_RecommendFunctionsResponse__Output>;
  recommendFunctions(argument: _shaple_RecommendFunctionsRequest, metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientReadableStream<_shaple_RecommendFunctionsResponse__Output>;
  recommendFunctions(argument: _shaple_RecommendFunctionsRequest, options?: grpc.CallOptions): grpc.ClientReadableStream<_shaple_RecommendFunctionsResponse__Output>;
  
}

export interface ShapleBuilderAIHandlers extends grpc.UntypedServiceImplementation {
  CloseRoom: grpc.handleUnaryCall<_shaple_CloseRoomRequest__Output, _shaple_CloseRoomResponse>;
  
  GetRoom: grpc.handleUnaryCall<_shaple_GetRoomRequest__Output, _shaple_GetRoomResponse>;
  
  OpenRoom: grpc.handleUnaryCall<_shaple_OpenRoomRequest__Output, _shaple_OpenRoomResponse>;
  
  PublishFeed: grpc.handleUnaryCall<_shaple_PublishFeedRequest__Output, _shaple_PublishFeedResponse>;
  
  RecommendFunctions: grpc.handleServerStreamingCall<_shaple_RecommendFunctionsRequest__Output, _shaple_RecommendFunctionsResponse>;
  
}

export interface ShapleBuilderAIDefinition extends grpc.ServiceDefinition {
  CloseRoom: MethodDefinition<_shaple_CloseRoomRequest, _shaple_CloseRoomResponse, _shaple_CloseRoomRequest__Output, _shaple_CloseRoomResponse__Output>
  GetRoom: MethodDefinition<_shaple_GetRoomRequest, _shaple_GetRoomResponse, _shaple_GetRoomRequest__Output, _shaple_GetRoomResponse__Output>
  OpenRoom: MethodDefinition<_shaple_OpenRoomRequest, _shaple_OpenRoomResponse, _shaple_OpenRoomRequest__Output, _shaple_OpenRoomResponse__Output>
  PublishFeed: MethodDefinition<_shaple_PublishFeedRequest, _shaple_PublishFeedResponse, _shaple_PublishFeedRequest__Output, _shaple_PublishFeedResponse__Output>
  RecommendFunctions: MethodDefinition<_shaple_RecommendFunctionsRequest, _shaple_RecommendFunctionsResponse, _shaple_RecommendFunctionsRequest__Output, _shaple_RecommendFunctionsResponse__Output>
}

import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { ShapleBuilderAIClient as _shaple_ShapleBuilderAIClient, ShapleBuilderAIDefinition as _shaple_ShapleBuilderAIDefinition } from './shaple/ShapleBuilderAI';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  shaple: {
    CloseRoomRequest: MessageTypeDefinition
    CloseRoomResponse: MessageTypeDefinition
    GetRoomRequest: MessageTypeDefinition
    GetRoomResponse: MessageTypeDefinition
    OpenRoomRequest: MessageTypeDefinition
    OpenRoomResponse: MessageTypeDefinition
    PublishFeedRequest: MessageTypeDefinition
    PublishFeedResponse: MessageTypeDefinition
    RecommendFunctionsRequest: MessageTypeDefinition
    RecommendFunctionsResponse: MessageTypeDefinition
    RecommendFunctionsSummary: MessageTypeDefinition
    ShapleBuilderAI: SubtypeConstructor<typeof grpc.Client, _shaple_ShapleBuilderAIClient> & { service: _shaple_ShapleBuilderAIDefinition }
    Turn: MessageTypeDefinition
  }
}


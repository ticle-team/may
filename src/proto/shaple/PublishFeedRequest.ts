// Original file: src/proto/sbai.proto


export interface PublishFeedRequest {
  'version'?: (string);
  'functionsDataframe'?: (Buffer | Uint8Array | string);
  'functionMapDataframe'?: (Buffer | Uint8Array | string);
}

export interface PublishFeedRequest__Output {
  'version': (string);
  'functionsDataframe': (Buffer);
  'functionMapDataframe': (Buffer);
}

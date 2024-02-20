import * as protoLoader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import {ProtoGrpcType} from '@/proto/sbai';

const protoDef = protoLoader.loadSync('src/proto/sbai.proto', {
  keepCase: false,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true,
});
const proto = (grpc.loadPackageDefinition(protoDef) as unknown) as ProtoGrpcType;

export function get_sbai() {
  return new proto.shaple.ShapleBuilderAI(
    process.env.NEXT_PUBLIC_SBAI_URL || 'localhost:50051',
    grpc.credentials.createInsecure(),
  );
}

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
  const url = new URL(process.env.SBAI_URL || 'grpc://localhost:50051?ssl=false');

  const secured = url.searchParams.get('ssl') === 'true';

  return new proto.shaple.ShapleBuilderAI(
    `${url.hostname}:${url.port}`,
    secured ? grpc.credentials.createSsl() : grpc.credentials.createInsecure(),
  );
}

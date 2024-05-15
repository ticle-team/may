import { baseProcedure, router } from '@/server/trpc';
import { z } from 'zod';
import { observable } from '@trpc/server/observable';
import { RecommendServicesOutput, Room, room } from '@/types';
import assert from 'assert';
import { RecommendFunctionsRequest } from '@/proto/shaple/RecommendFunctionsRequest';
import { RecommendFunctionsResponse } from '@/proto/shaple/RecommendFunctionsResponse';
import { getSBAI } from '@/server/domain/third_party';
import { OpenRoomRequest } from '@/proto/shaple/OpenRoomRequest';
import { OpenRoomResponse } from '@/proto/shaple/OpenRoomResponse';
import { GetRoomResponse } from '@/proto/shaple/GetRoomResponse';

export default router({
  openRoom: baseProcedure
    .output(
      z.object({
        roomId: z.number(),
      }),
    )
    .mutation(async () => {
      const sbai = getSBAI();
      try {
        const resp = await new Promise<OpenRoomResponse>((resolve, reject) => {
          sbai.OpenRoom({} as OpenRoomRequest, (err, resp) => {
            if (err) {
              reject(err);
            } else {
              resolve(resp as OpenRoomResponse);
            }
          });
        });

        return {
          roomId: resp.roomId as number,
        };
      } finally {
        sbai.close();
      }
    }),
  getRoom: baseProcedure
    .input(
      z.object({
        roomId: z.number(),
      }),
    )
    .output(room)
    .query(async ({ input: { roomId } }): Promise<Room> => {
      if (roomId == 0) {
        return {
          id: 0,
          history: [],
        };
      }

      const sbai = getSBAI();
      try {
        const { history } = await new Promise<GetRoomResponse>(
          (resolve, reject) => {
            sbai.GetRoom({ roomId } as OpenRoomRequest, (err, resp) => {
              if (err) {
                reject(err);
              } else {
                resolve(resp as GetRoomResponse);
              }
            });
          },
        );

        return {
          id: roomId,
          history:
            history?.map(
              ({ userInput, botAnswer, recommendFunctionsSummary }) => ({
                userInput: userInput ?? '',
                botAnswer: botAnswer ?? null,
                recommendFunctionsSummary: recommendFunctionsSummary
                  ? {
                      functionGroups: recommendFunctionsSummary.functionGroups!,
                      functions: recommendFunctionsSummary.functions!,
                    }
                  : null,
              }),
            ) ?? [],
        };
      } finally {
        sbai.close();
      }
    }),
  recommendServices: baseProcedure
    .input(
      z.object({
        roomId: z.number(),
        userInput: z.string(),
      }),
    )
    .subscription(({ input: { roomId, userInput } }) => {
      assert(userInput.length > 0, 'userInput must not be empty');
      const sbai = getSBAI();
      const stream = sbai.RecommendFunctions({
        roomId,
        userInput,
      } as RecommendFunctionsRequest);

      return observable<RecommendServicesOutput>((emit) => {
        const onData = (resp: RecommendFunctionsResponse) => {
          switch (resp.body) {
            case 'detail':
              emit.next({
                type: 'detail',
                seqNum: resp.detail!.seqNum,
                chunk: resp.detail!.chunk,
              } as RecommendServicesOutput);
              break;
            case 'summary':
              emit.next({
                type: 'summary',
                domain: resp.summary!.domain,
                functionGroups: resp.summary!.functionGroups,
                functions: resp.summary!.functions,
              } as RecommendServicesOutput);
              break;
            default:
              emit.error(new Error('unknown response'));
          }
        };

        const onError = (err: Error) => {
          console.error('recommendServices error: ', err);
          emit.error(err);
        };

        const onEnd = () => {
          console.log('recommendServices end');
          emit.next({
            type: 'end',
          });
          emit.complete();
        };

        stream.on('data', onData);
        stream.on('error', onError);
        stream.on('end', onEnd);

        return () => {
          console.log('close subscription');
          sbai.close();
        };
      });
    }),
});

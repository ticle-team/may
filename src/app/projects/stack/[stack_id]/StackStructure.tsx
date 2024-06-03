'use client';

import React, { useState } from 'react';
import { Stack } from '@/models/stack';
import Badge from '@/app/_components/Badge';
import { VapiRelease } from '@/models/vapi';

type Props = {
  stack: Stack;
  onClickVapi: (vapi: VapiRelease) => void;
  children?: React.ReactNode;
};

export default function StackStructure({
  stack,
  onClickVapi,
  children,
}: Props) {
  return (
    <div className="flex w-full mt-5 justify-between">
      <div className="w-[25%] flex flex-col gap-y-12">
        <div className="flex flex-col gap-y-2">
          <div className="flex mb-2">
            <span className="font-semibold text-base">Base API</span>
          </div>
          {!stack.authEnabled &&
            !stack.storageEnabled &&
            !stack.postgrestEnabled && (
              <div className="flex ml-5 justify-between">
                <span className="font-normal text-sm text-gray-400">
                  No BaseAPIs are active
                </span>
              </div>
            )}

          {stack.authEnabled && (
            <div className="flex ml-5 justify-between">
              <span className="font-normal text-sm">Auth API</span>
              <div className="flex gap-x-3">
                <Badge color="pink">V1.0</Badge>
              </div>
            </div>
          )}
          {stack.postgrestEnabled && (
            <div className="flex ml-5 justify-between">
              <span className="font-normal text-sm">Database API</span>
              <div className="flex gap-x-3">
                <Badge color="pink">V1.0</Badge>
              </div>
            </div>
          )}
          {stack.storageEnabled && (
            <div className="flex ml-5 justify-between">
              <span className="font-normal text-sm">Storage API</span>
              <div className="flex gap-x-3">
                <Badge color="pink">V1.0</Badge>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-y-2">
          <div className="flex mb-2">
            <span className="font-semibold text-base">Vertical API</span>
          </div>
          {!stack.vapis ||
            (stack.vapis.length === 0 && (
              <div className="ml-5">
                <span className="font-normal text-sm text-gray-400">
                  No VAPIs are active
                </span>
              </div>
            ))}
          {stack.vapis &&
            stack.vapis.map((vapi, index) => (
              <div
                key={`vapi-${index}`}
                className="ml-5 hover:cursor-pointer"
                onClick={() => {
                  onClickVapi(vapi);
                }}
              >
                <span className="font-normal text-sm">{vapi.pkg?.name}</span>
              </div>
            ))}
        </div>
      </div>
      <div className="flex flex-col w-[calc(75%-100px)]">{children}</div>
    </div>
  );
}

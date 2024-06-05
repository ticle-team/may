'use client';

import React from 'react';
import { Stack } from '@/models/stack';
import Badge from '@/app/_components/Badge';
import { VapiRelease } from '@/models/vapi';
import {
  ApiAddIcon,
  ExclamationCircleIcon,
  StopIcon,
  WarningIcon,
} from '@/app/_components/Icons';

type Props = {
  stack: Stack;
  onClickVapiBtn: (vapi: VapiRelease) => void;
  onClickAddApiBtn: (isBaseApi: boolean) => void;
};

const StackFeatures = ({ stack, onClickVapiBtn, onClickAddApiBtn }: Props) => {
  return (
    <>
      <div className="flex flex-col gap-y-2">
        <div className="flex mb-2 items-center gap-x-2">
          <span className="font-semibold text-base">Base API</span>
          <button onClick={() => onClickAddApiBtn(true)}>
            <ApiAddIcon />
          </button>
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
              {/* TODO: Implement version and status display function of Auth API  */}
              <Badge color="pink">V1.0</Badge>
              <ExclamationCircleIcon />
            </div>
          </div>
        )}
        {stack.postgrestEnabled && (
          <div className="flex ml-5 justify-between">
            <span className="font-normal text-sm">Database API</span>
            <div className="flex gap-x-3">
              {/* TODO: Implement version and status display function of Database API  */}
              <Badge color="pink">V1.0</Badge>
              <WarningIcon />
            </div>
          </div>
        )}
        {stack.storageEnabled && (
          <div className="flex ml-5 justify-between">
            <span className="font-normal text-sm">Storage API</span>
            <div className="flex gap-x-3">
              {/* TODO: Implement version and status display function of Storage API  */}
              <Badge color="pink">V1.0</Badge>
              <StopIcon />
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-y-2">
        <div className="flex mb-2 items-center gap-x-2">
          <span className="font-semibold text-base">Vertical API</span>
          <button onClick={() => onClickAddApiBtn(false)}>
            <ApiAddIcon />
          </button>
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
            <button
              key={`vapi-${index}`}
              className="ml-5 text-left"
              onClick={() => {
                onClickVapiBtn(vapi);
              }}
            >
              <span className="font-normal text-sm">{vapi.pkg?.name}</span>
            </button>
          ))}
      </div>
    </>
  );
};

export default StackFeatures;

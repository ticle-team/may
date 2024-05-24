'use client';

import React from 'react';
import { Stack } from '@/models/stack';
import { StarIcon } from '@heroicons/react/20/solid';
import Badge from '@/app/_components/Badge';
import {
  ExclamationCircleIcon,
  StopIcon,
  WarningIcon,
} from '@/app/_components/Icons';

type Props = {
  stack: Stack;
};

export default function StackStructure({ stack }: Props) {
  const handleVAPIUninstall = () => {
    // TODO: Implement VAPI uninstall feature
  };

  return (
    <div className="flex mt-5 gap-x-20">
      <div className="w-full flex flex-col gap-y-12">
        <div className="flex flex-col gap-y-2">
          <div className="flex mb-2">
            <span className="font-semibold text-base">Base API</span>
          </div>

          {stack!.authEnabled && (
            <div className="flex ml-5 justify-between">
              <span className="font-normal text-sm">Auth API</span>
              <div className="flex gap-x-3">
                <Badge color="pink">V1.0</Badge>
                <ExclamationCircleIcon />
              </div>
            </div>
          )}
          {stack!.postgrestEnabled && (
            <div className="flex ml-5 justify-between">
              <span className="font-normal text-sm">Database API</span>
              <div className="flex gap-x-3">
                <Badge color="pink">V1.0</Badge>
                <StopIcon />
              </div>
            </div>
          )}
          {stack!.storageEnabled && (
            <div className="flex ml-5 justify-between">
              <span className="font-normal text-sm">Storage API</span>
              <div className="flex gap-x-3">
                <Badge color="pink">V1.0</Badge>
                <WarningIcon />
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-y-2">
          <div className="flex mb-2">
            <span className="font-semibold text-base">Vertical API</span>
          </div>
          {stack!.vapis.map((vapi) => (
            <div className="ml-5 hover:cursor-pointer">
              <span>{vapi.pkg?.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-y-2">
            <div className="flex gap-x-5 items-center">
              <span className="text-base font-semibold text-gray-900">
                VAPI#1
              </span>
              <StarIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex gap-x-3">
              <Badge color="pink">V1.0</Badge>
              <ExclamationCircleIcon />
            </div>
          </div>
          <button
            className="font-normal text-sm text-blue-500"
            onClick={handleVAPIUninstall}
          >
            Uninstall
          </button>
        </div>
        {/* TODO: must be changed to swagger-ui-react */}
        <div className="mt-4 border border-black w-[500px] h-[132px]"></div>
        <div className="flex flex-col mt-4 ml-5">
          <span>POST /v1/api/users/id</span>
          <span>GET /v1/api/users/id</span>
          <span>DELETE /v1/api/users/id</span>
        </div>
      </div>
    </div>
  );
}

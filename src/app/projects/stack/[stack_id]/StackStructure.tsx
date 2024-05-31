'use client';

import React, { useState } from 'react';
import { Stack } from '@/models/stack';
import { StarIcon } from '@heroicons/react/20/solid';
import Badge from '@/app/_components/Badge';
import { ExclamationCircleIcon } from '@/app/_components/Icons';
import { VapiRelease } from '@/models/vapi';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Props = {
  stack: Stack;
};

export default function StackStructure({ stack }: Props) {
  const [selectedVAPI, setSelectedVAPI] = useState<VapiRelease | null>(null);

  const handleClickVAPI = (vapiName: VapiRelease | null) => {
    if (selectedVAPI === vapiName) {
      return setSelectedVAPI(null);
    }
    setSelectedVAPI(vapiName);
  };

  const handleVAPIUninstall = () => {
    // TODO: Implement VAPI uninstall feature
  };

  const convertToDocsUrl = (
    githubRepo: string,
    githubBranch: string,
    vapiName: string,
  ) => {
    if (!githubRepo || !vapiName) return '';
    return `https://raw.githubusercontent.com/${githubRepo}/${githubBranch}/${vapiName}/docs.yml`;
  };

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
                  handleClickVAPI(vapi ?? null);
                }}
              >
                <span className="font-normal text-sm">{vapi.pkg?.name}</span>
              </div>
            ))}
        </div>
      </div>
      <div className="flex flex-col w-[calc(75%-100px)]">
        {selectedVAPI && (
          <div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-y-2">
                <div className="flex gap-x-5 items-center">
                  <span className="text-base font-semibold text-gray-900">
                    {selectedVAPI.pkg?.name}
                  </span>
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="flex gap-x-3">
                  <Badge color="pink">{selectedVAPI.version}</Badge>
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
            <div>
              <SwaggerUI
                url={convertToDocsUrl(
                  stack.githubRepo,
                  stack.githubBranch,
                  selectedVAPI.pkg?.name ?? '',
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

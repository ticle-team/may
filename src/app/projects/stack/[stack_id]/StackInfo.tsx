'use client';

import React, { useState } from 'react';
import { FigmaIcon, ServicePlanIcon } from '@/app/_components/Icons';
import { Instance, Stack } from '@/models/stack';
import Button from '@/app/_components/Button';
import Modal from '@/app/_components/Modal';
import AddReferenceModal from './AddReferenceModal';
import AddInstanceModal from './AddInstanceModal';

type Props = {
  stack: Stack;
  instances: Instance[];
  isInstancesQueryLoading: boolean;
};

export default function StackInfo({
  stack,
  instances,
  isInstancesQueryLoading,
}: Props) {
  const [showAddInstanceDialog, setShowAddInstanceDialog] =
    useState<boolean>(false);
  const [showAddReferenceDialog, setShowAddReferenceDialog] =
    useState<boolean>(false);

  const handleAddInstance = async (zone: string, name: string) => {
    // TODO: Implement on instance added
  };

  const handleEditDescription = async () => {
    // TODO: Implement edit description feature
  };

  const handleAddReference = async (title: string, url: string) => {
    // TODO: Implement on reference added
  };

  return (
    <>
      <Modal
        open={showAddReferenceDialog}
        setOpen={setShowAddReferenceDialog}
        contents={
          <AddReferenceModal
            onCancel={() => {
              setShowAddReferenceDialog(false);
            }}
            onAdd={handleAddReference}
          />
        }
      />
      <Modal
        open={showAddInstanceDialog}
        setOpen={setShowAddInstanceDialog}
        contents={
          <AddInstanceModal
            onCancel={() => {
              setShowAddInstanceDialog(false);
            }}
            onAdd={handleAddInstance}
          />
        }
      />
      <div className="mt-5 flex flex-col gap-x-6 gap-y-12">
        <div>
          <div className="flex items-center gap-x-4">
            <label className="block text-base font-semibold leading-6 text-gray-900">
              Description
            </label>
            <Button onClick={handleEditDescription}>Edit</Button>
          </div>
          <div className="mt-4">
            <textarea
              rows={5}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              defaultValue={stack?.description}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-x-4">
            <label className="block text-base font-semibold leading-6 text-gray-900">
              Reference
            </label>
            <Button
              onClick={() => {
                setShowAddReferenceDialog(true);
              }}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-col mt-4 gap-y-4">
            {/* TODO: Implement get reference list feature */}
            <div className="flex gap-x-6">
              <FigmaIcon />
              <span className="font-normal text-sm">와이어프레임 컨셉</span>
              <button className="font-normal text-sm text-indigo-500 hover:cursor-pointer">
                Edit
              </button>
            </div>
            <div className="flex gap-x-6">
              <ServicePlanIcon />
              <span className="font-normal text-sm">서비스 기획서</span>
              <button className="font-normal text-sm text-indigo-500 hover:cursor-pointer">
                Edit
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-base font-semibold leading-6 text-gray-900">
              Instance List
            </label>
            <Button
              onClick={() => {
                setShowAddInstanceDialog(true);
              }}
            >
              Create
            </Button>
          </div>
          <div className="mt-4 px-4 sm:px-6 lg:px-8">
            <div className="flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          Instance
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          spec
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                        >
                          region
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {isInstancesQueryLoading && (
                        <tr>
                          <td colSpan={4} className="py-10 h-5 text-center">
                            <span className="text-xl font-medium text-primary-600 animate-pulse">
                              Loading...
                            </span>
                          </td>
                        </tr>
                      )}
                      {/* TODO: contents of the table must be modified. */}
                      {!isInstancesQueryLoading &&
                        instances.map((instance) => (
                          <tr key={`instance-${instance.id}`}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              instance#{instance.id}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              1
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              plargeX
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                              {instance.zone}
                            </td>
                          </tr>
                        ))}
                      {!isInstancesQueryLoading && instances.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center py-10 text-xl font-medium text-gray-900 sm:pl-0 "
                          >
                            No instances
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

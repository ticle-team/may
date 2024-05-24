import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

export type DropdownItem = {
  label: string;
  value: string;
};

type Props = {
  className?: string;
  items: DropdownItem[];
  selectedValue?: string | null;
  placeholder?: string;
  onSelected?: (item: DropdownItem) => void;
};

export default function Dropdown({
  className,
  items,
  selectedValue,
  placeholder,
  onSelected,
}: Props) {
  return (
    <div className={className}>
      <Menu as="div" className="w-full relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            <div className="flex w-full">
              {!items.find((item) => item.value === selectedValue) ||
              !selectedValue ? (
                <div className="text-gray-400">{placeholder}</div>
              ) : (
                items.find((item) => item.value === selectedValue)?.label
              )}
            </div>
            <ChevronDownIcon
              className="-mr-1 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>

        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute w-full right-0 z-10 mt-2 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {items.map((item, index) => (
                <Menu.Item key={`dropdown_item_${index}`}>
                  {({ active }) => (
                    <button
                      onClick={() => {
                        onSelected && onSelected(item);
                      }}
                      className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left`}
                    >
                      {item.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

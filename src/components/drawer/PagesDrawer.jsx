import { Fragment } from "react";
import {
  Dialog,
  DialogPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanels,
  TabPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import Link from "next/link";
import { pages } from "@utils/data";
import { X } from "lucide-react";
import Category from "@components/category/Category";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const PagesDrawer = ({ open, setOpen, categories, categoryError }) => {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 z-40 flex items-end">
          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <DialogPanel className="relative flex w-full max-h-[85vh] flex-col overflow-y-auto bg-white pb-12 shadow-xl rounded-t-2xl">
              {/* Header */}
              <div className="flex px-4 pb-2 pt-5 justify-between items-center sticky top-0 bg-white z-10 border-b border-gray-100">
                <Link href="/" className="flex flex-shrink-0 items-center" onClick={() => setOpen(false)}>
                  <img
                    className="h-8 w-auto px-2"
                    src="https://res.cloudinary.com/dezs8ma9n/image/upload/v1766484997/horecaLogo_hirtnv.png"
                    alt="Horeca1"
                  />
                </Link>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              {/* Tabs */}
              <TabGroup as="div" className="flex flex-col h-full">
                {/* Tab list */}
                <div className="border-b border-gray-100">
                  <TabList className="flex space-x-8 px-4 justify-center">
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          selected
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-gray-500",
                          "whitespace-nowrap border-b-2 px-6 py-4 text-base font-semibold focus:outline-none transition-colors"
                        )
                      }
                    >
                      Categories
                    </Tab>
                    <Tab
                      className={({ selected }) =>
                        classNames(
                          selected
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-gray-500",
                          "whitespace-nowrap border-b-2 px-6 py-4 text-base font-semibold focus:outline-none transition-colors"
                        )
                      }
                    >
                      More
                    </Tab>
                  </TabList>
                </div>

                {/* Tab panels */}
                <TabPanels className="flex-1 overflow-y-auto px-2 py-4">
                  {/* Category Panel */}
                  <TabPanel className="focus:outline-none">
                    <div className="space-y-6">
                      <div className="rounded-md">
                        <Category
                          categories={categories}
                          categoryError={categoryError}
                          onClose={() => setOpen(false)}
                        />
                      </div>
                    </div>
                  </TabPanel>

                  {/* Pages Panel */}
                  <TabPanel className="focus:outline-none">
                    <div className="grid grid-cols-2 gap-3 px-2">
                      {pages.map((page) => (
                        <Link
                          key={page.title}
                          href={page.href}
                          onClick={() => setOpen(false)}
                          className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                        >
                          <page.icon className="w-6 h-6 text-gray-600 group-hover:text-primary-600 mb-2 transition-colors" />
                          <span className="text-xs font-semibold text-gray-700 text-center">
                            {page.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </TabPanel>
                </TabPanels>
              </TabGroup>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PagesDrawer;


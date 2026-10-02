'use client'

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, Transition } from '@headlessui/react'
import { PlusIcon } from '@heroicons/react/24/solid'

type Ref = { _id: string; name?: string; label?: string; }

type ModalProps = {
  routes: Ref[];
  shippingLines: Ref[];
  services: Ref[];
  terminals: Ref[];
}

export function CreateRouteLineConfigModal({ routes, shippingLines, services, terminals }: ModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ 
    routeId: '', 
    shippingLineId: '',
    serviceId: '',
    terminalId: '',
  })

  function closeModal() {
    setIsOpen(false)
    setError(null)
  }

  function openModal() {
    setIsOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('/api/route-line-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Error saving config');
      closeModal();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-x-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <PlusIcon className="-ml-0.5 h-5 w-5" />
        New Config
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Create New Route Line Config
                  </Dialog.Title>
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {error && <div className="p-2 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Route *</label>
                            <select name="routeId" value={formData.routeId} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black">
                                <option value="">Select...</option>
                                {routes.map(item => <option key={item._id} value={item._id}>{item.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Shipping Line *</label>
                            <select name="shippingLineId" value={formData.shippingLineId} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black">
                                <option value="">Select...</option>
                                {shippingLines.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Service (Optional)</label>
                            <select name="serviceId" value={formData.serviceId} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black">
                                <option value="">Select...</option>
                                {services.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Terminal (Optional)</label>
                            <select name="terminalId" value={formData.terminalId} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black">
                                <option value="">Select...</option>
                                {terminals.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                      <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200" onClick={closeModal}>
                        Cancel
                      </button>
                      <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        Create Config
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

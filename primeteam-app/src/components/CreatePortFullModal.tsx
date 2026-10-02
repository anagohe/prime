'use client'

import { useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, Transition } from '@headlessui/react'
import { PlusIcon } from '@heroicons/react/24/solid'

type Props = {
  countries: any[];
  regions: any[];
  title?: string;
};

export function CreatePortFullModal({ countries, regions, title = 'POL' }: Props) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    portName: '',
    portCode: '',
    countryId: '',
    isNewCountry: false,
    newCountryName: '',
    newCountryIso: '',
  })

  function closeModal() {
    setIsOpen(false)
    setError(null)
    setFormData({
      portName: '',
      portCode: '',
      countryId: '',
      isNewCountry: false,
      newCountryName: '',
      newCountryIso: '',
    })
  }

  function openModal() {
    setIsOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as any).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let finalCountryId = formData.countryId;

      if (formData.isNewCountry) {
        const countryRes = await fetch('/api/countries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.newCountryName,
            iso3166: formData.newCountryIso
          })
        });
        if (!countryRes.ok) throw new Error('Error al crear el país');
        const country = await countryRes.json();
        finalCountryId = country._id;
      }

      const portRes = await fetch('/api/ports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.portName,
          code: formData.portCode,
          type: title === 'POL' ? 'POL' : (title === 'POD' ? 'POD' : 'BOTH'),
          country: finalCountryId
        })
      });

      if (!portRes.ok) throw new Error('Error al crear el puerto');

      closeModal();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-x-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all"
      >
        <PlusIcon className="-ml-0.5 h-4 w-4" />
        Añadir {title}
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
                  <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 border-b pb-3">
                    Añadir Nuevo {title}
                  </Dialog.Title>
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {error && <div className="p-2 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{title} (Nombre) *</label>
                        <input type="text" name="portName" value={formData.portName} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black" placeholder="Ej: ALTAMIRA" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">IATA {title} *</label>
                        <input type="text" name="portCode" value={formData.portCode} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black uppercase" placeholder="Ej: MXATM" />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">País {title} *</label>
                        <label className="flex items-center text-xs text-indigo-600 font-semibold cursor-pointer">
                          <input type="checkbox" name="isNewCountry" checked={formData.isNewCountry} onChange={handleInputChange} className="mr-1 rounded" />
                          ¿Nuevo País?
                        </label>
                      </div>
                      
                      {!formData.isNewCountry ? (
                        <select name="countryId" value={formData.countryId} onChange={handleInputChange} required={!formData.isNewCountry} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black">
                          <option value="">Seleccionar País...</option>
                          {countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      ) : (
                        <div className="space-y-3 bg-gray-50 p-3 rounded-md border border-gray-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Nombre del País</label>
                              <input type="text" name="newCountryName" value={formData.newCountryName} onChange={handleInputChange} required={formData.isNewCountry} className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm text-black" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">ISO 3166</label>
                              <input type="text" name="newCountryIso" value={formData.newCountryIso} onChange={handleInputChange} required={formData.isNewCountry} className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm text-black uppercase" maxLength={5} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                      <button type="button" className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={closeModal} disabled={loading}>
                        Cancelar
                      </button>
                      <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2" disabled={loading}>
                        {loading ? 'Guardando...' : `Guardar ${title}`}
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

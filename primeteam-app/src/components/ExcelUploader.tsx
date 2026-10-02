'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { ArrowUpTrayIcon, DocumentCheckIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

export function ExcelUploader() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setResult(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = e.target?.result
      if (!data) {
        setResult({ success: false, message: 'Error al leer el archivo.' })
        setLoading(false)
        return
      }
      
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(worksheet)

      try {
        const response = await fetch('/api/upload-itineraries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.message || 'Ocurrió un error.')
        }

        setResult({ success: true, message: responseData.message })
      } catch (error: any) {
        setResult({ success: false, message: error.message })
      } finally {
        setLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="w-full max-w-lg p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Importar Itinerarios desde Excel</h3>
      <div className="mt-4">
        <label
          htmlFor="file-upload"
          className="relative flex justify-center w-full px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400"
        >
          <div className="space-y-1 text-center">
            <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <span className="font-medium text-indigo-600">Sube un archivo</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept=".xlsx, .xlsb" disabled={loading}/>
            </div>
            <p className="text-xs text-gray-500">.xlsx, .xlsb hasta 10MB</p>
          </div>
        </label>
      </div>
      {fileName && <p className="mt-2 text-sm text-gray-500">Archivo: {fileName}</p>}
      {loading && <p className="mt-4 text-sm text-center text-gray-600 animate-pulse">Procesando archivo...</p>}
      {result && (
        <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {result.success ? (
                <DocumentCheckIcon className="w-5 h-5 text-green-400" aria-hidden="true" />
              ) : (
                <ExclamationCircleIcon className="w-5 h-5 text-red-400" aria-hidden="true" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>{result.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

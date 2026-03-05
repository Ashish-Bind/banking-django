import { Loader2 } from 'lucide-react'
import React from 'react'

export default function Loader() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
    </div>
  )
}

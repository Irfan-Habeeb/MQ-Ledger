'use client'

import Link from 'next/link'

export default function TestStyles() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Tailwind CSS Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Test Card 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Primary Colors</h2>
            <div className="space-y-2">
              <div className="bg-blue-600 text-white p-3 rounded">Blue 600</div>
              <div className="bg-green-600 text-white p-3 rounded">Green 600</div>
              <div className="bg-red-600 text-white p-3 rounded">Red 600</div>
            </div>
          </div>

          {/* Test Card 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Background Colors</h2>
            <div className="space-y-2">
              <div className="bg-background text-foreground p-3 rounded border">Background</div>
              <div className="bg-card text-card-foreground p-3 rounded border">Card</div>
              <div className="bg-primary text-primary-foreground p-3 rounded">Primary</div>
            </div>
          </div>

          {/* Test Card 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Spacing & Layout</h2>
            <div className="space-y-2">
              <div className="p-4 bg-gray-100 rounded">Padding 4</div>
              <div className="m-4 bg-gray-200 rounded">Margin 4</div>
              <div className="w-full h-8 bg-gray-300 rounded">Full Width</div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Main App
          </Link>
        </div>
      </div>
    </div>
  )
}
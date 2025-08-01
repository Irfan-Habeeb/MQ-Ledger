'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DebugPage() {
  const [cssVariables, setCssVariables] = useState<Record<string, string>>({})
  const [tailwindWorking, setTailwindWorking] = useState(false)

  useEffect(() => {
    // Check if CSS variables are loaded
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)
    
    const variables = {
      '--background': computedStyle.getPropertyValue('--background'),
      '--foreground': computedStyle.getPropertyValue('--foreground'),
      '--primary': computedStyle.getPropertyValue('--primary'),
      '--card': computedStyle.getPropertyValue('--card'),
    }
    
    setCssVariables(variables)
    
    // Check if Tailwind classes are working
    const testElement = document.createElement('div')
    testElement.className = 'bg-blue-600 text-white p-4 rounded'
    testElement.style.position = 'absolute'
    testElement.style.left = '-9999px'
    testElement.textContent = 'Test'
    document.body.appendChild(testElement)
    
    const computed = getComputedStyle(testElement)
    const hasTailwind = computed.backgroundColor !== '' && computed.backgroundColor !== 'rgba(0, 0, 0, 0)'
    
    setTailwindWorking(hasTailwind)
    document.body.removeChild(testElement)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Debug Information</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CSS Variables */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">CSS Variables</h2>
            <div className="space-y-2">
              {Object.entries(cssVariables).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-mono text-sm">{key}:</span>
                  <span className="font-mono text-sm text-gray-600">{value || 'not set'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tailwind Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tailwind Status</h2>
            <div className="space-y-4">
              <div className={`p-4 rounded ${tailwindWorking ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>Tailwind CSS:</strong> {tailwindWorking ? '✅ Working' : '❌ Not Working'}
              </div>
              
              <div className="p-4 bg-blue-600 text-white rounded">
                This should be blue if Tailwind is working
              </div>
              
              <div className="p-4 bg-red-600 text-white rounded">
                This should be red if Tailwind is working
              </div>
            </div>
          </div>
        </div>

        {/* Test Colors */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Color Tests</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background text-foreground p-4 rounded border">Background</div>
            <div className="bg-card text-card-foreground p-4 rounded border">Card</div>
            <div className="bg-primary text-primary-foreground p-4 rounded">Primary</div>
            <div className="bg-secondary text-secondary-foreground p-4 rounded">Secondary</div>
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
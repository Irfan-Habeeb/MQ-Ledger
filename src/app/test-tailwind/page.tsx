import Link from 'next/link'

export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-blue-500 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Tailwind Test Page
        </h1>
        
        <div className="space-y-4">
          <div className="bg-red-500 text-white p-4 rounded">
            This should be red background with white text
          </div>
          
          <div className="bg-green-500 text-white p-4 rounded">
            This should be green background with white text
          </div>
          
          <div className="bg-blue-500 text-white p-4 rounded">
            This should be blue background with white text
          </div>
          
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            This should be a purple button
          </button>
        </div>
        
        <div className="mt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
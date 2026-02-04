import { useState } from 'react'

function App() {
    const [count, setCount] = useState(0)

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h1 className="text-3xl font-bold text-blue-600 mb-4">
                    Enterprise Asset Manager
                </h1>
                <p className="text-gray-600 mb-6">
                    Frontend initialized with React, TypeScript, Vite, and Tailwind CSS.
                </p>
                <div className="card">
                    <button
                        onClick={() => setCount((count) => count + 1)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        count is {count}
                    </button>
                    <p className="mt-4 text-sm text-gray-500">
                        Edit <code>src/App.tsx</code> and save to test HMR
                    </p>
                </div>
            </div>
        </div>
    )
}

export default App

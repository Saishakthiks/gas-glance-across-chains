import React from 'react'
import { GasPriceChart } from './components/GasPriceChart'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Gas Glance Across Chains
        </h1>
        <GasPriceChart />
      </div>
    </div>
  )
}

export default App
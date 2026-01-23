import { BrowserRouter } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-8">
          <h1 className="text-4xl font-bold text-primary mb-4">HRM8 ATS</h1>
          <p className="text-muted-foreground">
            Project initialization complete. Ready for component extraction.
          </p>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App

import { RouterProvider } from "react-router"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/auth.context.jsx"
import { InterviewProvider } from "./features/interview/interview.context.jsx"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {

  return (
    <AuthProvider>
      <InterviewProvider>
        <RouterProvider router={router} />
        <Analytics />
        <SpeedInsights />
      </InterviewProvider>
    </AuthProvider>
  )
}

export default App

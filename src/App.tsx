import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'

export default function App() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  )
}

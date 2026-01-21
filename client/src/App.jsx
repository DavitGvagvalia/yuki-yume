import AppRoutes from './routes/routes.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import PageWrapper from './components/layout/PageWrapper.jsx'
import { BrowserRouter } from 'react-router-dom'
function App() {
  return (
    <BrowserRouter>
      <PageWrapper>
        <Navbar />
        <AppRoutes />
        <Footer />
      </PageWrapper>
    </BrowserRouter>
  )
}

export default App
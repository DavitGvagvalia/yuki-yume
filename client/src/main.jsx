import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ProductsProvider } from './hooks/useProducts.jsx'
import { CartProvider } from './hooks/useCart.jsx'
import { SelectionProvider } from './hooks/useSelection.jsx'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
     <ProductsProvider>
        <CartProvider>
            <SelectionProvider>
      <App />
      </SelectionProvider>
      </CartProvider>
    </ProductsProvider>
    </BrowserRouter>
)
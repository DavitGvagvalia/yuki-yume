import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ProductsProvider } from './hooks/useProducts.jsx'
import { CartProvider } from './hooks/useCart.jsx'
import { SelectionProvider } from './hooks/useSelection.jsx'
import { CheckoutProvider } from './hooks/useCheckout'
import { DetailProvider } from './hooks/useDetail'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
    <CheckoutProvider>
    
     <ProductsProvider>
        <CartProvider>
            <DetailProvider>
            <SelectionProvider>
      <App />
      </SelectionProvider>
      </DetailProvider>
      </CartProvider>
    </ProductsProvider>
    </CheckoutProvider>
    </BrowserRouter>
)
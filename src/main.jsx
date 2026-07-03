import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ProductsProvider } from './hooks/useProducts.jsx'
import { CategoriesProvider } from './hooks/useCategories.jsx'
import { CartProvider } from './hooks/useCart.jsx'
import { SelectionProvider } from './hooks/useSelection.jsx'
import { CheckoutProvider } from './hooks/useCheckout'
import { DetailProvider } from './hooks/useDetail'
import { OrderProvider } from './hooks/useOrders.jsx'
import { StrictMode } from 'react'


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <OrderProvider>
                <CheckoutProvider>
                    <CategoriesProvider>
                        <ProductsProvider>
                            <CartProvider>
                                <DetailProvider>
                                    <SelectionProvider>
                                        <App />
                                    </SelectionProvider>
                                </DetailProvider>
                            </CartProvider>
                        </ProductsProvider>
                    </CategoriesProvider>
                </CheckoutProvider>
            </OrderProvider>
        </BrowserRouter>
    </StrictMode>
)

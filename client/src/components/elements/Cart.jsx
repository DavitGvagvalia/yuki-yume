import React from 'react'

function Cart({ Toggle, ChosenItems }) {

    return (
        Toggle && 
        <div className='absolute inset-0 w-screen h-screen bg-black/40 backdrop-blur-md shadow-lg z-50 flex flex-col justify-center justify-items-center '>
            <div className='flex flex-col max-h-screen z-52 justify-items-center'>
                {ChosenItems.map((item,index)=>(
                    <div key = {index}>
                        <div className='text-white text-2xl'>{item.name}</div>
                    </div>
                ))}

            </div>
        </div>)

}

export default Cart
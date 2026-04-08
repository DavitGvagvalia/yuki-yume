import { MinusIcon,PlusIcon } from "@heroicons/react/24/outline";


const Quantifier = ({
    value,
    onIncrease,
    onDecrease,
}) => {
    return (
        <div className='bg-accent-muted text-white rounded-2xl flex gap-3 items-center justify-center p-1'>
        <button className=' bg-black rounded-4xl  flex items-center justify-center  w-5 h-5 active:scale-110' 
        onClick={onDecrease}><MinusIcon className="aspect-square w-4"/></button>
        <span>{value}</span>
        <button className='  bg-black rounded-4xl flex items-center justify-center w-5 h-5 active:scale-110'
        onClick={onIncrease}><PlusIcon className="aspect-square w-4"/></button>
    </div>
  );
};
export default Quantifier
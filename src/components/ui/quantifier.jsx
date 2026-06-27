import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";


export const Quantifier = ({
    value,
    onIncrease,
    onDecrease,
}) => {
    return (
        <div className='flex items-center justify-center gap-3 rounded-3xl border border-border bg-control p-1 text-text'>

            <button className='flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-text transition hover:bg-accent hover:text-on-accent active:scale-110 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-muted'
                disabled={value === 0}
                onClick={onDecrease}><MinusIcon className={`aspect-square w-4 ${value === 0 ? "disabled opacity-50" : ""}`} /></button>
            <span className="min-w-5 text-center text-sm font-semibold">{value}</span>
            <button className='flex h-6 w-6 items-center justify-center rounded-full bg-accent text-on-accent transition hover:bg-accent-hover active:scale-110'
                onClick={onIncrease}><PlusIcon className="aspect-square w-4" /></button>

        </div>
    );
};

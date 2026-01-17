import logo from '../../assets/images/logo.png';
import fuji from '../../assets/images/fuji.png';
function Hero() {
    return (
        <div
            id="Hero"
            className='relative h-screen z-9 flex items-center justify-center flex-col'
        >
            {/* Hero background */}
            <img src={fuji} alt="" className='absolute inset-0 w-full h-full z-0 object-cover' />
            <div className="absolute inset-0 bg-sky-950 opacity-40 z-0" />

            {/* Hero content */}
            <div className="relative z-10 container px-4 text-center md:opacity-0 text-open md:animate-(--text-open)" >

                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 leading-tight">
                    YUKI YUME
                </h1>

                <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
                    ORDER!  TRY! FALL IN LOVE!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">

                    <a href='#Menu'
                        className="bg-(--china-red) border-2 border-gold-500 h-11 rounded-md text-lg px-8 py-6 align-middle "
                    >
                        View Menu
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Hero;

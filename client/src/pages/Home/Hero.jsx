import { Link } from 'react-router-dom'
import heroImage from '../../../assets/images/heroImage.png';
function Hero() {
    return (
        <section
            id="hero"
            className="relative h-[90dvh] flex items-center justify-center flex-col"
        >
            {/* Hero background */}

                <img src={heroImage} alt="" className='absolute ml-[40%] top-[8%] h-[40dvh] w-full object-cover z-[-1]' />


                <h1
                    className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-text mb-6 leading-tight"
                >
                    YUKI YUME
                </h1>

                <p
                    className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10"
                >
                    ORDER! TRY! FALL IN LOVE!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/menu"
                        className="inline-flex items-center justify-center h-11 px-8 bg-accent hover:bg-accent-hover text-background rounded-md text-lgtransition duration-normal"
                    >
                        View Menu
                    </Link>
                </div>
        </section>
    );
}

export default Hero;

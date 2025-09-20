import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Images
import carousel1 from '@/assets/carousel-1.jpg';
import carousel2 from '@/assets/carousel-2.jpg';
import carousel3 from '@/assets/carousel-3.jpg';
import carousel4 from '@/assets/carousel-4.jpg';
import carousel5 from '@/assets/carousel-5.jpg';
import carousel6 from '@/assets/carousel-6.jpg';

const images = [carousel1, carousel2, carousel3, carousel4, carousel5, carousel6];

const ImageCarousel = () => {
  // Refs for imperative, jank-free updates
  const sectionRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const contentWidthRef = useRef(0);
  const viewportWidthRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const lastActiveIndexRef = useRef(0);

  // Light state that changes infrequently
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGalleryActive, setIsGalleryActive] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);

  // Measure sizes
  const measure = () => {
    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    if (!wrapper || !track) return;
    viewportWidthRef.current = wrapper.clientWidth;
    contentWidthRef.current = track.scrollWidth;
  };

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rafIdRef.current) return; // throttle to one paint
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (!sectionRef.current || !trackRef.current) return;

        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const sectionHeight = sectionRef.current.offsetHeight;

        // Visibility controls (update state only when value changes)
        const shouldShowCarousel = rect.top < windowHeight * 0.8;
        if (shouldShowCarousel !== showCarousel) setShowCarousel(shouldShowCarousel);

        const shouldBeActive = rect.top <= 0 && rect.bottom >= windowHeight * 0.5;
        if (shouldBeActive !== isGalleryActive) setIsGalleryActive(shouldBeActive);

        // Progress (no state updates here)
        const scrolled = Math.max(0, -rect.top);
        const maxScroll = Math.max(1, sectionHeight - windowHeight);
        const progress = Math.min(1, Math.max(0, scrolled / maxScroll));

        // Update progress bar width imperatively
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${progress * 100}%`;
        }

        // Calculate center position in the viewport
        const centerProgress = progress * (images.length - 1);
        
        // Update each image scale based on distance from center
        images.forEach((_, index) => {
          const distanceFromCenter = Math.abs(index - centerProgress);
          
          // Scale: 1.0 at center, gets smaller the further away
          const scale = Math.max(0.3, 1 - distanceFromCenter * 0.25);
          const opacity = Math.max(0.2, 1 - distanceFromCenter * 0.3);
          
          const imageEl = trackRef.current?.children[index] as HTMLElement;
          if (imageEl) {
            imageEl.style.transform = `scale(${scale})`;
            imageEl.style.opacity = opacity.toString();
            imageEl.style.willChange = 'transform, opacity';
          }
        });

        // Discrete active index for display purposes
        const newActive = Math.round(progress * (images.length - 1));
        if (newActive !== lastActiveIndexRef.current) {
          lastActiveIndexRef.current = newActive;
          setActiveIndex(newActive);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial paint
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [isGalleryActive, showCarousel]);

  const skipGallery = () => {
    if (!sectionRef.current) return;
    const sectionBottom = sectionRef.current.offsetTop + sectionRef.current.offsetHeight;
    // Instant jump past the carousel
    window.scrollTo(0, sectionBottom);
  };


  return (
    <section
      ref={sectionRef}
      data-section="carousel"
      className="h-[200vh] relative bg-gradient-to-b from-background to-card"
    >
      {/* Fixed title & controls */}
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 text-center z-30 transition-opacity duration-300 ${
          isGalleryActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
          Scroll to Explore Gallery
        </h2>
        <p className="text-muted-foreground mb-6">
          Keep scrolling to see the horizontal carousel in action
        </p>
        <button
          onClick={skipGallery}
          className="bg-secondary/80 hover:bg-secondary text-secondary-foreground px-6 py-3 rounded-full transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-border"
        >
          <div className="flex items-center space-x-2">
            <span>Skip Gallery</span>
            <ChevronDown size={18} />
          </div>
        </button>
      </div>

      {/* Sticky viewport */}
      <div ref={wrapperRef} className="sticky top-1/2 -translate-y-1/2 h-80 overflow-hidden">
        <div
          ref={trackRef}
          className={`flex items-center justify-center gap-12 h-full ${showCarousel ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        >
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="relative rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ease-out"
              style={{ minWidth: '320px', height: '200px' }}
            >
              <img
                src={img}
                alt={`Gallery image ${idx + 1}`}
                className="w-80 h-50 object-cover"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed progress indicator */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-300 ${
          isGalleryActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-background/80 backdrop-blur-sm rounded-full px-6 py-3 border border-border">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div ref={progressBarRef} className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: '0%' }} />
            </div>
            <span className="text-sm text-foreground font-mono">
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageCarousel;

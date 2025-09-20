/**
 * ImageCarousel
 * - Scroll-driven, single RAF loop
 * - Lightweight per-frame updates (transform + opacity only)
 * - Uses refs to avoid state churn and listener rebinds
 */
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
  const isGalleryActiveRef = useRef(false);
  const showCarouselRef = useRef(false);

  // Light state that changes infrequently
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGalleryActive, setIsGalleryActive] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);

  // Measure sizes: cache viewport width and full track width to avoid layout thrash during scroll
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

  // Scroll handler: throttled to one paint via RAF, updates transforms only
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
        if (shouldShowCarousel !== showCarouselRef.current) {
          showCarouselRef.current = shouldShowCarousel;
          setShowCarousel(shouldShowCarousel);
        }

        const shouldBeActive = rect.top <= 0 && rect.bottom >= windowHeight * 0.5;
        if (shouldBeActive !== isGalleryActiveRef.current) {
          isGalleryActiveRef.current = shouldBeActive;
          setIsGalleryActive(shouldBeActive);
        }

        // Bail out early when the carousel isn't in its sticky active window
        if (!shouldBeActive) {
          return;
        }

        // Progress (no state updates here)
        const scrolled = Math.max(0, -rect.top);
        const maxScroll = Math.max(1, sectionHeight - windowHeight);
        const rawProgress = Math.min(1, Math.max(0, scrolled / maxScroll));
        
        // Don't start moving carousel until 20% through the section
        const startThreshold = 0.2;
        const finalProgress = rawProgress < startThreshold ? 0 : (rawProgress - startThreshold) / (1 - startThreshold);

        // Update progress bar width imperatively (show actual scroll progress)
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${rawProgress * 100}%`;
        }

        // Calculate center position in the viewport
        const centerProgress = finalProgress * (images.length - 1);
        
        // Move the entire track horizontally based on scroll progress
        const imageWidth = 320 + 48; // image width + gap
        const viewportCenter = viewportWidthRef.current / 2;
        const firstImageCenter = imageWidth / 2; // Center of first image
        
        // Start with first image centered, then move through others
        const baseOffset = viewportCenter - firstImageCenter;
        const scrollOffset = -finalProgress * imageWidth * (images.length - 1);
        const trackTranslateX = baseOffset + scrollOffset;
        
        trackRef.current.style.transform = `translate3d(${trackTranslateX}px, 0, 0)`;
        
        // Update each image scale based on distance from center (lightweight: transform + opacity only)
        images.forEach((_, index) => {
          const distanceFromCenter = Math.abs(index - centerProgress);
          let scale: number;
          let opacity: number;

          if (distanceFromCenter < 0.1) {
            scale = 1.3;
            opacity = 1;
          } else if (distanceFromCenter < 0.6) {
            scale = Math.max(0.7, 1.3 - distanceFromCenter * 0.8);
            opacity = Math.max(0.4, 1 - distanceFromCenter * 0.6);
          } else {
            scale = Math.max(0.3, 1 - distanceFromCenter * 0.4);
            opacity = Math.max(0.2, 1 - distanceFromCenter * 0.5);
          }

          const imageEl = trackRef.current?.children[index] as HTMLElement;
          if (imageEl) {
            imageEl.style.transform = `scale(${scale})`;
            imageEl.style.opacity = opacity.toString();
          }
        });

        // Discrete active index for display purposes
        const newActive = Math.round(finalProgress * (images.length - 1));
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
  }, []);

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
          className={`flex items-center gap-12 h-full ${showCarousel ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          style={{ willChange: 'transform', width: 'max-content' }}
        >
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="relative rounded-xl overflow-hidden flex-shrink-0"
              style={{ width: '320px', height: '200px', willChange: 'transform, opacity' }}
            >
              <img
                src={img}
                alt={`Gallery image ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width={320}
                height={200}
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

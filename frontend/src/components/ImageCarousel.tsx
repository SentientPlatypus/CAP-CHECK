/**
 * ImageCarousel
 * - Scroll-driven, single RAF loop
 * - Lightweight per-frame updates (transform + opacity only)
 * - Uses refs to avoid state churn and listener rebinds
 * - Cache-busting update
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
  const scrollProgressRef = useRef(0);

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
        const shouldBeActive = rect.top <= 0 && rect.bottom >= windowHeight * 0.5;
        const shouldShowCarousel = shouldBeActive; // Only show carousel when scroll text is active
        
        if (shouldShowCarousel !== showCarouselRef.current) {
          showCarouselRef.current = shouldShowCarousel;
          setShowCarousel(shouldShowCarousel);
        }

        // Progress bar should disappear when we scroll completely past the section
        const shouldShowProgress = rect.bottom > windowHeight * 0.2;
        if (shouldShowProgress !== isGalleryActiveRef.current) {
          isGalleryActiveRef.current = shouldShowProgress;
          setIsGalleryActive(shouldShowProgress);
        }

        // Bail out early when the carousel isn't in its sticky active window
        if (!shouldShowCarousel) {
          return;
        }

        // Progress (no state updates here)
        const scrolled = Math.max(0, -rect.top);
        const maxScroll = Math.max(1, sectionHeight - windowHeight);
        const rawProgress = Math.min(1, Math.max(0, scrolled / maxScroll));
        
        // Start moving carousel immediately with scroll
        const finalProgress = rawProgress;

        // Update progress bar width imperatively (show actual scroll progress)
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${rawProgress * 100}%`;
        }

        // Store scroll progress for use in render
        scrollProgressRef.current = rawProgress;

        // Update carousel vertical position smoothly
        if (wrapperRef.current) {
          const verticalOffset = rawProgress * (sectionHeight - windowHeight);
          wrapperRef.current.style.top = `${windowHeight / 2 + verticalOffset}px`;
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
      className="h-[200vh] relative overflow-hidden"
      style={{ backgroundColor: '#0a1724' }}
    >
      {/* Animated sparks background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="spark-particle absolute w-1 h-1 bg-primary rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      {/* Fixed title & controls */}
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 text-center z-30 transition-opacity duration-300 ${
          isGalleryActive && activeIndex < images.length - 1 && showCarousel ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <h2 className="text-4xl font-bold font-pixel text-white mb-4"
            style={{ 
              textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
              imageRendering: 'pixelated'
            }}>
          Scroll to Explore Gallery
        </h2>
        <p className="text-white font-pixel mb-6 bg-black/60 px-4 py-2 rounded-xl"
           style={{ imageRendering: 'pixelated' }}>
          Keep scrolling to see the horizontal carousel in action
        </p>
      </div>

      {/* Moving viewport that follows scroll */}
      <div 
        ref={wrapperRef} 
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 overflow-hidden"
        style={{ 
          willChange: 'top'
        }}
      >
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

    </section>
  );
};

export default ImageCarousel;

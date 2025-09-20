import PixelButton3D from './PixelButton3D';

interface ScrollButtonProps {
  scrollProgress: number;
}

const ScrollButton = ({ scrollProgress }: ScrollButtonProps) => {
  // Convert scroll progress to press state
  const isPressed = scrollProgress > 0.1;

  return (
    <section className="grid place-content-center p-12">
      <div className="w-32 h-32">
        <PixelButton3D 
          isPressed={isPressed} 
          scrollProgress={scrollProgress} 
        />
      </div>
    </section>
  );
};

export default ScrollButton;
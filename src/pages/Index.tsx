import HeroSection from '@/components/HeroSection';
import ImageCarousel from '@/components/ImageCarousel';
import MessageInterface from '@/components/MessageInterface';
import TextReader from '@/components/TextReader';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ImageCarousel />
      <MessageInterface />
      <TextReader />
    </div>
  );
};

export default Index;
import { motion } from "framer-motion";
import { FiBatteryCharging, FiWifi } from "react-icons/fi";
import redButton8bit from "@/assets/red-button-8bit.png";

interface ScrollPhoneProps {
  scrollProgress: number;
}

const ScrollPhone = ({ scrollProgress }: ScrollPhoneProps) => {
  return (
    <section className="grid place-content-center p-12">
      <FloatingPhone scrollProgress={scrollProgress} />
    </section>
  );
};

const FloatingPhone = ({ scrollProgress }: { scrollProgress: number }) => {
  // Convert scroll progress to animation values
  const translateZ = 8 + (scrollProgress * 24); // 8px to 32px
  const translateY = -2 + (scrollProgress * -6); // -2px to -8px
  
  return (
    <div
      style={{
        transformStyle: "preserve-3d",
        transform: "rotateY(-30deg) rotateX(15deg)",
      }}
      className="rounded-[24px] bg-violet-500"
    >
      <motion.div
        style={{
          transform: `translateZ(${translateZ}px) translateY(${translateY}px)`,
        }}
        className="relative h-96 w-56 rounded-[24px] border-2 border-b-4 border-r-4 border-white border-l-neutral-200 border-t-neutral-200 bg-neutral-900 p-1 pl-[3px] pt-[3px]"
      >
        <HeaderBar />
        <Screen />
      </motion.div>
    </div>
  );
};

const HeaderBar = () => {
  return (
    <>
      <div className="absolute left-[50%] top-2.5 z-10 h-2 w-16 -translate-x-[50%] rounded-md bg-neutral-900"></div>
      <div className="absolute right-3 top-2 z-10 flex gap-2">
        <FiWifi className="text-neutral-600" />
        <FiBatteryCharging className="text-neutral-600" />
      </div>
    </>
  );
};

const Screen = () => {
  return (
    <div className="relative z-0 grid h-full w-full place-content-center overflow-hidden rounded-[20px] bg-black">
      {/* 8-bit Red Button */}
      <img 
        src={redButton8bit} 
        alt="8-bit Red Button" 
        className="w-32 h-24 object-contain pixelated"
        style={{ imageRendering: 'pixelated' }}
      />

      <div className="absolute -bottom-72 left-[50%] h-96 w-96 -translate-x-[50%] rounded-full bg-red-600" />
    </div>
  );
};

export default ScrollPhone;
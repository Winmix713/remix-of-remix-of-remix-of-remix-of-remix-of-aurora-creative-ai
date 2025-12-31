import { Header } from "@/components/aurora/Header";
import { BackgroundBlobs } from "@/components/aurora/BackgroundBlobs";
import { HeroSection } from "@/components/aurora/HeroSection";
import { FeaturesSection } from "@/components/aurora/FeaturesSection";
import { Footer } from "@/components/aurora/Footer";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-aurora-purple/20 selection:text-aurora-purple">
      {/* Background Ambience */}
      <BackgroundBlobs />

      {/* Main Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow flex flex-col items-center w-full">
          <HeroSection />
          <FeaturesSection />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Index;

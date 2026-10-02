import { Footer } from "@/components/home/Footer";
import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesGrid } from "@/components/home/ServicesGrid";

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ServicesGrid />
      </main>
      <Footer />
    </div>
  );
}

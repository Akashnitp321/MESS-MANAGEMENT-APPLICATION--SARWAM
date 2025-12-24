import React from "react";
import HeroSection from "./HeroSection";
import ProblemSection from "./ProblemSection";
import DualRoleSection from "./DualRoleSection";
import FAQSection from "./FaqSection";
import Footer from "./Footer";

import SolutionsSection from "./SolutionSection";
import TestimonialsSection from "./TestimonialsSection";



function HomePage() {
  return (
    <div>
      <HeroSection/>
      <ProblemSection/>
      <SolutionsSection/>
      <DualRoleSection/>
      <TestimonialsSection/>
      <FAQSection/>
      <Footer/>
    </div>
  )
}

export default HomePage

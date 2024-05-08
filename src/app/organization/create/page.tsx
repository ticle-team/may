'use client'

import { useEffect, useState } from "react";
import Step1Section from "./Step1Section";
import Step2Section from "./Step2Section";
import Step3Section from "./Step3Section";

export default function Page() {
  const [currentStep, setCurrentStep] = useState(1);
  const [currentSection, setCurrentSection] = useState<React.ReactNode>(null);

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  }

  useEffect(() => {
    switch (currentStep) {
      case 1:
        setCurrentSection(<Step1Section handleNextStep={handleNextStep} />);
        break;
      case 2:
        setCurrentSection(<Step2Section handleNextStep={handleNextStep} />);
        break;
      case 3:
        setCurrentSection(<Step3Section />);
        break;
      default:
        setCurrentSection(null);
    }
  }, [currentStep]);

  return (
    <div>
      {currentSection}
    </div>
  )
}

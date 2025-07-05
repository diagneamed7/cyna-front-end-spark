// src/hooks/useMultiStepForm.ts - Hook pour les formulaires multi-étapes
import { useState } from 'react';

interface StepConfig {
  id: string;
  title: string;
  description?: string;
  validate?: () => boolean;
}

interface UseMultiStepFormReturn {
  currentStep: number;
  currentStepConfig: StepConfig;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export const useMultiStepForm = (steps: StepConfig[]): UseMultiStepFormReturn => {
  const [currentStep, setCurrentStep] = useState(0);

  const currentStepConfig = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const canGoNext = !isLastStep && (!currentStepConfig.validate || currentStepConfig.validate());
  const canGoPrev = !isFirstStep;

  const nextStep = () => {
    if (canGoNext) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    if (canGoPrev) {
      setCurrentStep(prev => Math.max(prev - 1, 0));
    }
  };

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  };

  return {
    currentStep,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    progress,
    nextStep,
    prevStep,
    goToStep,
    canGoNext,
    canGoPrev
  };
};
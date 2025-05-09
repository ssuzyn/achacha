import { useState } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { markAppAsLaunched } from '../utils/appStorage';
import { guideSteps } from '../constants/guideContent'; // 분리된 콘텐츠 import

export const useGuideSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigation = useNavigation();

  const currentContent = guideSteps[currentStep];
  const isLastStep = currentStep === guideSteps.length - 1;

  const handleNext = async () => {
    if (!isLastStep) {
      // 다음 단계로 이동
      setCurrentStep(currentStep + 1);
    } else {
      // 마지막 단계에서 Permission 화면으로 이동
      try {
        await markAppAsLaunched();
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Permission' }],
          })
        );
      } catch (error) {
        // Fallback navigation
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Permission' }],
          })
        );
      }
    }
  };

  return {
    currentStep,
    currentContent,
    isLastStep,
    handleNext,
    totalSteps: guideSteps.length, // 페이지네이션 등을 위해 총 단계 수 반환
  };
};

import { useState } from 'react';
import { Car, Home, Baby, ArrowRight } from 'lucide-react';

interface QuestionsProps {
  onComplete: (answers: { hasCar: boolean; housingStatus: 'rent' | 'own'; hasKids: boolean }) => void;
}

type QuestionKey = 'hasCar' | 'housingStatus' | 'hasKids';

interface Question {
  key: QuestionKey;
  icon: React.ReactNode;
  question: string;
  options: { value: string; label: string }[];
}

const questions: Question[] = [
  {
    key: 'hasCar',
    icon: <Car className="w-8 h-8" />,
    question: 'Do you drive in the city?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'housingStatus',
    icon: <Home className="w-8 h-8" />,
    question: 'Do you rent or own?',
    options: [
      { value: 'rent', label: 'Rent' },
      { value: 'own', label: 'Own' },
    ],
  },
  {
    key: 'hasKids',
    icon: <Baby className="w-8 h-8" />,
    question: 'Do you have children in SFUSD?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
];

export function Questions({ onComplete }: QuestionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [questions[currentIndex].key]: value };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete({
        hasCar: newAnswers.hasCar === 'yes',
        housingStatus: newAnswers.housingStatus as 'rent' | 'own',
        hasKids: newAnswers.hasKids === 'yes',
      });
    }
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentIndex ? 'bg-amber-500' : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Question Card */}
        <div
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center
                     transform transition-all duration-300"
        >
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
            {currentQuestion.icon}
          </div>

          <h3 className="text-xl font-semibold mb-8">{currentQuestion.question}</h3>

          <div className="flex gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4
                           bg-zinc-800 hover:bg-zinc-700 text-zinc-200
                           rounded-lg transition-colors border border-zinc-700
                           hover:border-amber-500 group"
              >
                <span className="font-medium">{option.label}</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6">
          This helps us find civic issues that directly affect you
        </p>
      </div>
    </div>
  );
}

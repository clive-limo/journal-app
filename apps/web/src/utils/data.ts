import cookingDinner from '@/assets/images/cooking_dinner.svg';
import quieteReflection from '@/assets/images/quiet_reflections.svg';
import morningReflection from '@/assets/images/morning_reflection.svg';
import hikingTrails from '@/assets/images/hiking_trails.svg';
import { Brain, Calendar, MessageCircle, TrendingUp } from 'lucide-vue-next';

export const cardDetails = [
  {
    title: 'Morning Run Reflections',
    dayCount: 4,
    imageSrc: morningReflection,
    color: `#F1ACB4`,
  },
  {
    title: 'Cooking Dinner with Friends',
    dayCount: 12,
    imageSrc: quieteReflection,
    color: `#F7BF46`,
  },
  {
    title: 'Quite Reflections before Sleep',
    dayCount: 24,
    imageSrc: cookingDinner,
    color: `#432818`,
  },
  {
    title: 'Hiking through the new tails',
    dayCount: 32,
    imageSrc: hikingTrails,
    color: `#514F4D`,
  },
];

export const howItWorksSteps = [
  {
    id: 1,
    icon: MessageCircle,
    title: 'Express Yourself',
    description:
      'Talk, type, or voice record your thoughts. No pressure for perfect words—just be yourself.',
    color: 'text-blue-500',
  },
  {
    id: 2,
    icon: Brain,
    title: 'AI Understanding',
    description:
      'Our AI analyzes your entries, understanding emotions, patterns, and themes in your daily experiences.',
    color: 'text-purple-500',
  },
  {
    id: 3,
    icon: TrendingUp,
    title: 'Discover Patterns',
    description:
      'Get insights into your emotional patterns, growth areas, and personal development journey.',
    color: 'text-green-500',
  },
  {
    id: 4,
    icon: Calendar,
    title: 'Track Progress',
    description:
      'Watch your progress over time with beautiful visualizations and meaningful reflections.',
    color: 'text-orange-500',
  },
];

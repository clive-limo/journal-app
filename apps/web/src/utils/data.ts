import cookingDinner from '@/assets/images/cooking_dinner.svg';
import quieteReflection from '@/assets/images/quiet_reflections.svg';
import morningReflection from '@/assets/images/morning_reflection.svg';
import hikingTrails from '@/assets/images/hiking_trails.svg';
import {
  BarChart3,
  Brain,
  Calendar,
  Crown,
  Heart,
  MessageCircle,
  MoonStar,
  Shield,
  Smartphone,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-vue-next';

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

export const mainFeatures = [
  {
    icon: MessageCircle,
    title: 'Multiple Input Methods',
    description:
      'Write, type, or record voice notes. Express yourself however feels most natural.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description:
      'Our advanced AI analyzes your entries to identify patterns, emotions, and growth opportunities.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description:
      'Visualize your emotional journey with beautiful charts and meaningful progress indicators.',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
];

export const additionalFeatures = [
  {
    icon: Shield,
    title: 'Privacy First',
    description:
      'Your thoughts are encrypted and secure. We never share your personal data.',
  },
  {
    icon: Smartphone,
    title: 'Cross-Platform',
    description:
      'Access your journal from any device, anywhere, with seamless synchronization.',
  },
  {
    icon: Calendar,
    title: 'Smart Reminders',
    description:
      'Gentle, personalized reminders to help you maintain your journaling habit.',
  },
  {
    icon: BarChart3,
    title: 'Mood Analytics',
    description:
      'Understand your emotional patterns with detailed mood tracking and analysis.',
  },
  {
    icon: Heart,
    title: 'Wellness Focus',
    description:
      'Built with mental health best practices to support your wellbeing journey.',
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description:
      'Set and track personal growth goals with AI-powered guidance and motivation.',
  },
];

export const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for getting started with journaling',
    icon: MoonStar,
    monthlyPrice: 0,
    yearlyPrice: 0,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    buttonColor: 'bg-blue-500 hover:bg-blue-600',
    features: [
      '30 journal entries per month',
      'Basic AI insights',
      'Mobile app access',
      'Entry templates',
      'Basic mood tracking',
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For serious journalers seeking deeper insights',
    icon: Zap,
    monthlyPrice: 9,
    yearlyPrice: 79, // Save ~26%
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    buttonColor: 'bg-orange-500 hover:bg-orange-600',
    features: [
      'Unlimited journal entries',
      'Advanced AI analysis',
      'Detailed progress tracking',
      'Custom goal setting',
      'Voice-to-text journaling',
      'Export capabilities',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Ultimate journaling experience with coaching',
    icon: Crown,
    monthlyPrice: 19,
    yearlyPrice: 179, // Save ~22%
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    buttonColor: 'bg-purple-500 hover:bg-purple-600',
    features: [
      'Everything in Pro',
      'AI coaching suggestions',
      'Advanced analytics dashboard',
      'Habit tracking integration',
      'Weekly insights reports',
      'Custom reflection prompts',
      '1-on-1 onboarding call',
    ],
    popular: false,
  },
];

export const features = [
  { icon: Brain, text: 'AI-powered emotional insights' },
  { icon: TrendingUp, text: 'Progress visualization' },
  { icon: Shield, text: 'Bank-level security' },
  { icon: Smartphone, text: 'Cross-platform sync' },
  { icon: Calendar, text: 'Smart reminders' },
];

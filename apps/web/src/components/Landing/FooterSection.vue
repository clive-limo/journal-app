<script setup lang="ts">
import Text from '@/components/Typography/Text.vue';
import router from '@/router';
import {
  Mail,
  Twitter,
  Instagram,
  Linkedin,
  Heart,
  Shield,
  BookOpen,
  MessageCircle,
} from 'lucide-vue-next';

const currentYear = new Date().getFullYear();

const footerLinks = {
  product: [
    { name: 'How It Works', route: 'Features' },
    { name: 'Features', route: 'Features' },
    { name: 'Pricing', route: 'Pricing' },
    { name: 'Updates', href: '#' },
  ],
  resources: [
    { name: 'Blog', href: '#' },
    { name: 'Help Center', href: '#' },
    { name: 'Community', href: '#' },
    { name: 'Guides', href: '#' },
  ],
  company: [
    { name: 'About Us', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Press Kit', href: '#' },
    { name: 'Contact', href: '#' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cookie Policy', href: '#' },
    { name: 'Security', href: '#' },
  ],
};

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
  {
    name: 'Instagram',
    icon: Instagram,
    href: '#',
    color: 'hover:text-pink-400',
  },
  { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-600' },
  {
    name: 'Email',
    icon: Mail,
    href: 'mailto:hello@echojournal.com',
    color: 'hover:text-orange-500',
  },
];

const handleLinkClick = (link: any) => {
  if (link.route) {
    router.push({ name: link.route });
  } else if (link.href) {
    window.open(link.href, '_blank');
  }
};
</script>

<template>
  <footer class="bg-gray-900/5 backdrop-blur-lg">
    <!-- Main footer content -->
    <div class="px-16 md:px-8 lg:px-16 xl:px-32 2xl:px-40 py-16">
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12"
      >
        <!-- Brand section -->
        <div class="lg:col-span-2">
          <div class="flex flex-col space-y-4">
            <img
              src="@/assets/images/echo_journal_logo.png"
              class="h-[89px] w-[171px]"
              alt="Echo Journal Logo"
            />
            <Text variant="body" size="md" class="text-gray-600 max-w-sm">
              Transform your daily reflections into meaningful insights with
              AI-powered journaling.
            </Text>

            <!-- Social links -->
            <div class="flex gap-x-2 pt-2">
              <a
                v-for="social in socialLinks"
                :key="social.name"
                :href="social.href"
                :class="`text-gray-400 transition-colors duration-200 ${social.color}`"
                :aria-label="social.name"
              >
                <component :is="social.icon" class="w-5 h-5" />
              </a>
            </div>

            <!-- Trust badges -->
            <div class="flex items-center space-x-4 pt-4">
              <div
                class="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm"
              >
                <Shield class="w-4 h-4 text-green-500" />
                <Text
                  variant="body"
                  size="sm"
                  class="text-gray-700 font-medium"
                >
                  SOC 2 Compliant
                </Text>
              </div>
              <div
                class="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 shadow-sm"
              >
                <Heart class="w-4 h-4 text-red-500" />
                <Text
                  variant="body"
                  size="sm"
                  class="text-gray-700 font-medium"
                >
                  Made with Care
                </Text>
              </div>
            </div>
          </div>
        </div>

        <!-- Product links -->
        <div>
          <Text
            variant="subtitle"
            size="sm"
            class="font-semibold text-gray-900 mb-4"
          >
            Product
          </Text>
          <ul class="space-y-3">
            <li v-for="link in footerLinks.product" :key="link.name">
              <button
                @click="handleLinkClick(link)"
                class="text-gray-600 hover:text-orange-500 transition-colors duration-200 text-left"
              >
                <Text variant="body" size="sm">{{ link.name }}</Text>
              </button>
            </li>
          </ul>
        </div>

        <!-- Resources links -->
        <div>
          <Text
            variant="subtitle"
            size="sm"
            class="font-semibold text-gray-900 mb-4"
          >
            Resources
          </Text>
          <ul class="space-y-3">
            <li v-for="link in footerLinks.resources" :key="link.name">
              <button
                @click="handleLinkClick(link)"
                class="text-gray-600 hover:text-orange-500 transition-colors duration-200 text-left"
              >
                <Text variant="body" size="sm">{{ link.name }}</Text>
              </button>
            </li>
          </ul>
        </div>

        <!-- Company links -->
        <div>
          <Text
            variant="subtitle"
            size="sm"
            class="font-semibold text-gray-900 mb-4"
          >
            Company
          </Text>
          <ul class="space-y-3">
            <li v-for="link in footerLinks.company" :key="link.name">
              <button
                @click="handleLinkClick(link)"
                class="text-gray-600 hover:text-orange-500 transition-colors duration-200 text-left"
              >
                <Text variant="body" size="sm">{{ link.name }}</Text>
              </button>
            </li>
          </ul>
        </div>

        <!-- Legal links -->
        <div>
          <Text
            variant="subtitle"
            size="sm"
            class="font-semibold text-gray-900 mb-4"
          >
            Legal
          </Text>
          <ul class="space-y-3">
            <li v-for="link in footerLinks.legal" :key="link.name">
              <button
                @click="handleLinkClick(link)"
                class="text-gray-600 hover:text-orange-500 transition-colors duration-200 text-left"
              >
                <Text variant="body" size="sm">{{ link.name }}</Text>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Newsletter section -->
    <div
      class="bg-orange-500/20 border-t border-gray-100 px-16 md:px-8 lg:px-16 xl:px-32 2xl:px-40 py-12"
    >
      <div
        class="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0"
      >
        <div class="text-center lg:text-left">
          <div
            class="flex items-center justify-center lg:justify-start space-x-2 mb-2"
          >
            <BookOpen class="w-5 h-5 text-orange-500" />
            <Text
              variant="subtitle"
              size="md"
              class="font-semibold text-gray-900"
            >
              Stay Updated
            </Text>
          </div>
          <Text variant="body" size="sm" class="text-gray-600 max-w-md">
            Get tips on journaling, mindfulness, and personal growth delivered
            to your inbox.
          </Text>
        </div>

        <div
          class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full lg:w-auto"
        >
          <div class="relative">
            <input
              type="email"
              placeholder="Enter your email"
              class="w-full sm:w-80 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button
            class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap"
          >
            <Text variant="subtitle" size="sm">Subscribe</Text>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div
      class="bg-gray-50 border-t border-gray-100 px-16 md:px-8 lg:px-16 xl:px-32 2xl:px-40 py-6"
    >
      <div
        class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
      >
        <div
          class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6"
        >
          <Text variant="body" size="sm" class="text-gray-600">
            © {{ currentYear }} Echo Journal. All rights reserved.
          </Text>
          <div class="flex items-center space-x-2">
            <MessageCircle class="w-4 h-4 text-green-500" />
            <Text variant="body" size="sm" class="text-gray-600">
              24/7 Support Available
            </Text>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <Text variant="body" size="sm" class="text-gray-500">
            Made with
          </Text>
          <Heart class="w-4 h-4 text-red-500" />
          <Text variant="body" size="sm" class="text-gray-500">
            for your wellbeing
          </Text>
        </div>
      </div>
    </div>
  </footer>
</template>

import {
  Captions,
  FileText,
  GraduationCap,
  Languages,
  Link2,
  Megaphone,
  Video,
  Briefcase,
  Bug,
  Code2,
  EyeOff,
  Headphones,
  KeyRound,
  Layers,
  Lock,
  MessagesSquare,
  Mic,
  Monitor,
  Podcast,
  Presentation,
  Server,
  Share2,
  ShieldCheck,
  UploadCloud,
  Users,
} from "lucide-react";

export const features = [
  {
    icon: Link2,
    title: "Start with a video link",
    description:
      "Bring the video you want to dub by sharing its link, no need to start from a blank editing timeline.",
  },
  {
    icon: Languages,
    title: "Choose your target language",
    description:
      "Select a language for your audience and create a localized version of the source video.",
  },
  {
    icon: FileText,
    title: "Get the script alongside it",
    description:
      "Your dubbed video comes with its script, so the spoken content is easy to follow and review.",
  },
  {
    icon: Video,
    title: "A video ready to share",
    description:
      "Get the dubbed video as the finished result of your translation workflow.",
  },
];

export const useCases = [
  {
    icon: Users,
    title: "Personal use",
    description:
      "Enjoy your favourite creators, documentaries, and informative videos in your native language, even when a dub is not available.",
    image: "/img/usecase-personal.png",
  },
  {
    icon: Megaphone,
    title: "Creators",
    description:
      "Adapt videos for viewers who speak a different language and grow beyond one audience.",
    image: "/img/usecase-creator.png",
  },
  {
    icon: GraduationCap,
    title: "Educators",
    description:
      "Make lessons and explainers easier to follow for learners around the world.",
    image: "/img/usecase-education.png",
  },
  {
    icon: Video,
    title: "Marketing teams",
    description:
      "Localize product videos and campaigns for the audiences you want to reach.",
  },
  {
    icon: Users,
    title: "Growing businesses",
    description:
      "Share product knowledge and company videos with customers in their language.",
  },
];

export const faqs = [
  {
    question: "How does DubFlow work?",
    answer:
      "Provide a link to your video, choose the language you want, and DubFlow creates a dubbed video with its script.",
  },
  {
    question: "What do I get when dubbing is complete?",
    answer:
      "You get the video dubbed in your selected language and the script for that version.",
  },
  {
    question: "Do I need to upload a video file?",
    answer:
      "The workflow starts with a video link. Paste the link to the video you want to dub.",
  },
  {
    question: "Which languages can I choose?",
    answer:
      "Choose from the target languages available in the product when you start a dub.",
  },
  {
    question: "Who is DubFlow for?",
    answer:
      "DubFlow is for anyone who wants to make a video available to audiences who speak another language, including creators, educators, and teams.",
  },
];

export const recordingPoints = [
  {
    icon: Lock,
    title: "Recorded on your device",
    description:
      "Your audio and video are captured right in your browser and saved in small chunks as you record.",
  },
  {
    icon: UploadCloud,
    title: "Sent straight to storage",
    description:
      "Each chunk uploads directly to storage over an encrypted connection, instead of streaming through our servers.",
  },
  {
    icon: Share2,
    title: "Private until you share",
    description:
      "Recordings are private by default. You create a share link only when you want to, and can switch it off anytime.",
  },
  {
    icon: ShieldCheck,
    title: "Delete whenever you want",
    description:
      "Remove any recording at any time. It's gone from storage, not just hidden from view.",
  },
];

export const selfHostPoints = [
  {
    icon: Server,
    title: "Run it on your own infra",
    description:
      "Connect your own LiveKit and Cloudflare R2, and recordings are stored entirely on infrastructure you control.",
  },
  {
    icon: KeyRound,
    title: "Your keys are encrypted",
    description:
      "The API keys you add are encrypted with AES-256-GCM before they're stored, so they're never saved in plain text.",
  },
  {
    icon: EyeOff,
    title: "Keys are never read back",
    description:
      "Once saved, your keys are masked everywhere. The app only ever shows you a hidden preview, never the full value.",
  },
  {
    icon: Code2,
    title: "Open source and auditable",
    description:
      "Every line of DubFlow is public, so you can check for yourself exactly how your data and keys are handled.",
  },
];

export const pricingPlans = [
  {
    name: "Demo",
    price: "Free",
    priceSuffix: "",
    description:
      "Try DubFlow instantly, no keys or setup required.",
    features: [
      "720p recording",
      "44.1kHz audio",
      "15 minutes of recording",
      "Up to 2 participants",
      "48-hour retention",
      "Includes watermark",
      "Separate participant tracks",
      "Screen recorder",
      "No setup required",
    ],
    cta: "Try the demo",
    featured: false,
  },
  {
    name: "Pro",
    price: "$8.99",
    priceSuffix: "/mo",
    description:
      "Managed infrastructure with zero setup. Just hit record and we handle the rest.",
    features: [
      "Up to 4K recording",
      "48kHz audio",
      "20 hours of recording per month",
      "Up to 5 participants",
      "30-day recording retention",
      "No watermark",
      "Separate participant tracks",
      "Cloud backup",
      "Screen recorder",
    ],
    cta: "Start with Pro",
    featured: true,
  },
  {
    name: "Self-host",
    price: "Free",
    priceSuffix: "",
    description:
      "Unlimited and free when you run it on your own LiveKit and R2 keys.",
    features: [
      "Up to 4K recording",
      "48kHz audio",
      "Unlimited recording",
      "Unlimited participants",
      "Unlimited retention",
      "No watermark",
      "Separate participant tracks",
      "Cloud backup",
      "Screen recorder",
    ],
    cta: "Get started",
    featured: false,
  },
];

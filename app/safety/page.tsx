import { Metadata } from "next";
import {
  ShieldCheck,
  MapPin,
  CreditCard,
  Eye,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Safety Tips - BeforeSell",
  description: "Stay safe while buying and selling on BeforeSell. Follow these tips for a secure experience.",
};

const tips = [
  {
    icon: MapPin,
    title: "Meet in Public Places",
    description:
      "Always meet in a busy, well-lit public place like a shopping mall, café, or police station area. Never invite strangers to your home.",
  },
  {
    icon: Eye,
    title: "Inspect Before Buying",
    description:
      "Always inspect the item in person before paying. Test electronics, check documents for vehicles, and verify everything matches the ad description.",
  },
  {
    icon: CreditCard,
    title: "Use Cash on Delivery",
    description:
      "Pay only after seeing the item. Avoid sending money in advance via bKash, Nagad, or bank transfer to sellers you don't know.",
  },
  {
    icon: MessageCircle,
    title: "Keep Communication on Platform",
    description:
      "Use BeforeSell's messaging system for all communication. This helps us protect you and resolve disputes.",
  },
  {
    icon: AlertTriangle,
    title: "Beware of Scams",
    description:
      "If a deal sounds too good to be true, it probably is. Watch out for unusually low prices, pressure to pay quickly, or requests for personal information.",
  },
  {
    icon: ShieldCheck,
    title: "Trust Your Instincts",
    description:
      "If something feels wrong, walk away. Your safety is more important than any deal. Report suspicious listings or users to us.",
  },
];

export default function SafetyPage() {
  return (
    <div className="container px-4 py-12 max-w-4xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold">Safety Tips</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your safety is our priority. Follow these tips to have a secure buying and selling experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {tips.map((tip) => (
          <div key={tip.title} className="flex gap-4 p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <tip.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{tip.title}</h3>
              <p className="text-sm text-muted-foreground">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-lg bg-destructive/10 border border-destructive/20">
        <h2 className="text-xl font-semibold mb-2">Report Suspicious Activity</h2>
        <p className="text-muted-foreground">
          If you encounter a suspicious listing or user, please report it immediately. Contact us at{" "}
          <a href="mailto:help.beforesell@gmail.com" className="text-primary hover:underline">
            help.beforesell@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us - BeforeSell",
  description: "Get in touch with the BeforeSell team. We're here to help.",
};

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "support@beforesell.com",
    href: "mailto:support@beforesell.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+880 1534-792218",
    href: null,
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Dhaka, Bangladesh (Remote)",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="container px-4 py-12 max-w-4xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have a question, suggestion, or need help? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {contactInfo.map((item) => (
          <div key={item.label} className="text-center p-6 rounded-lg border bg-card">
            <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <item.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">{item.label}</h3>
            {item.href ? (
              <a href={item.href} className="text-sm text-primary hover:underline">
                {item.value}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">{item.value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="p-8 rounded-lg bg-muted/50">
        <h2 className="text-xl font-semibold mb-2">Follow Us</h2>
        <p className="text-muted-foreground mb-4">
          Stay updated with the latest from BeforeSell on social media.
        </p>
        <a
          href="https://www.facebook.com/beforesell.official/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook - BeforeSell Official
        </a>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import { BlogLayout } from "@/components/blog-layout";
import { getPost } from "@/lib/blog";
import { generateBlogMetadata } from "@/lib/seo";

const post = getPost("why-prefer-beforesell")!;

export const metadata: Metadata = generateBlogMetadata({ post, lang: "en" });

export default function Page() {
  return (
    <BlogLayout post={post} lang="en">
      <p className="lead">
        I&apos;m building another Bikroy.com — called <strong>BeforeSell</strong>. Same idea on the surface: a place where people in
        Bangladesh buy and sell things. But underneath, almost everything is different. This post explains why I started it, what
        I think Bikroy.com gets wrong, and why early users are already telling us they prefer ours.
      </p>

      <h2>If Bikroy already exists, why build another one?</h2>
      <p>
        Bikroy.com has been the default classifieds platform in Bangladesh for years. It works. It also has problems that anyone who
        has tried to actually buy or sell on it knows by heart — phone numbers leaking to strangers, scammers asking you to send a
        bKash payment up-front, listings that disappear behind paywalls, and a UI that hasn&apos;t moved much since 2014.
      </p>
      <p>
        BeforeSell is not a copy. It is the version of a Bangladeshi marketplace that I wished existed when I last tried to sell my
        old laptop. The four things below are why people are switching.
      </p>

      <h2>1. A UI that actually respects your time</h2>
      <p>
        Open Bikroy on a phone and count the seconds before you can read the first listing title. Banner ads, pop-ups, sticky CTAs,
        promoted-listing carousels — by the time the page settles, you forgot what you searched for.
      </p>
      <p>
        BeforeSell is built on a modern Next.js stack with image optimization, typography that reads well in both English and
        Bengali, and search filters that actually fit on a mobile screen. No banner ads on listing pages. No popups asking you to
        install an app while you&apos;re already on the app. Just the listing.
      </p>
      <p>
        Small things matter. Categories show real photos. Cards keep aspect ratios so your grid doesn&apos;t jitter. Hovering a card
        reveals the description without making you click. Every interaction is one tap shorter than it is on Bikroy. People notice.
      </p>

      <h2>2. No phone numbers — call directly from the app</h2>
      <p>
        This is the change I&apos;m proudest of. On Bikroy, your phone number is the contact channel. The moment you post a listing,
        your number is public. Anyone — buyers, scammers, harassers, robocallers — can call you, message you on WhatsApp, or save your
        number for later. We&apos;ve heard from sellers who got 30+ unrelated calls in a week.
      </p>
      <p>
        On BeforeSell, <strong>nobody sees your real phone number</strong>. Buyers tap a &quot;Call Seller&quot; button inside the
        BeforeSell app and the call is routed through us. The seller&apos;s phone rings, the buyer&apos;s phone rings, and the two
        people talk — but neither side ever sees the other&apos;s digits. When the deal is done, the channel is closed and that&apos;s
        the end of it.
      </p>
      <p>
        This single change shuts down most of the scam vectors that plague Bikroy: no more &quot;send me bKash to a personal number
        first&quot;, no more impersonation accounts harvesting numbers, no more harassment after a deal falls through. Both sides are
        anonymous until they choose to share more.
      </p>

      <h2>3. Agents who verify the product for the buyer</h2>
      <p>
        Even if the conversation is safe, the deal itself is not. The seller swears the laptop battery is fine. The buyer takes a
        Pathao ride across Dhaka. They meet, the battery is half-dead, the buyer walks away, the seller is annoyed. Multiply this
        by every micro-deal happening in the country every day.
      </p>
      <p>
        BeforeSell adds a layer that no other Bangladeshi marketplace has: <strong>verification agents</strong>. When a buyer is
        serious, they can request an agent visit. Our agent goes to the seller&apos;s location, opens the product, runs the checklist
        the buyer cares about (battery health, IMEI status, accessories, dents, working camera, working speaker — whatever applies
        to that category), takes photos, and reports back.
      </p>
      <p>
        If the product matches the listing, the buyer pays with confidence. If it doesn&apos;t, the buyer walks away before wasting
        a trip across town. The seller doesn&apos;t lose their day either — the agent handed-off the showing for them.
      </p>

      <h2>4. The seller doesn&apos;t have to be the showroom</h2>
      <p>
        Here&apos;s the part I think changes things for sellers. On Bikroy, selling means becoming a part-time customer-support rep.
        You answer the same questions twenty times. You meet five buyers, four of whom were never going to buy. You wait at a
        coffee shop. You drive across the city. You repeat for a week.
      </p>
      <p>
        On BeforeSell, the agent does the showings. You drop the product at the agent&apos;s pickup location, or the agent comes to
        you once. From that point on, every interested buyer is shown the product by our agent — not by you. You get a notification
        when it sells. You get paid. You move on with your week.
      </p>
      <p>
        We are essentially un-bundling the &quot;listing&quot; from the &quot;showing&quot;. Bikroy bundles them and dumps both on
        you. We let you opt out of the part you hate.
      </p>

      <h2>So what does this mean for buyers and sellers?</h2>
      <p>For <strong>sellers</strong>: less spam, less harassment, fewer wasted hours, and no need to play sales agent for your own
        broken phone.</p>
      <p>For <strong>buyers</strong>: a real human verifying the product before you commit, the ability to call without exposing
        your number, and a search experience that respects your phone&apos;s data plan.</p>

      <h2>What we&apos;re not pretending to be</h2>
      <p>
        BeforeSell isn&apos;t magic. The agent layer takes time to scale. Right now we cover Dhaka first, with Chattogram and Sylhet
        next. For categories outside our agent network, the platform still works without the verification step — you just lose the
        on-site check. The phone-mask and the cleaner UI you get from day one, everywhere.
      </p>
      <p>
        We&apos;re also not free in the same way Bikroy claims to be. Posting is free. The verification visit has a small fee that
        the buyer pays — usually a fraction of what a bad deal would have cost them. Sellers pay nothing extra unless they want a
        featured slot.
      </p>

      <h2>Why &quot;BeforeSell&quot;?</h2>
      <p>
        Because the real problem with marketplaces in Bangladesh isn&apos;t the listing — it&apos;s everything that has to happen
        <em> before</em> the sale: trust, verification, negotiation, showing up, not getting scammed. We named the company after the
        hard part. The selling is easy once the &quot;before&quot; is fixed.
      </p>

      <h2>Try it</h2>
      <p>
        If you have something to sell — a phone, a laptop, a bike, a fridge —{" "}
        <a href="/listings/new">post it for free on BeforeSell</a> and see the difference. If you&apos;re shopping, browse the
        categories and request an agent verification on anything that catches your eye.
      </p>
      <p>
        We&apos;re early. We&apos;re listening. If something on BeforeSell could be better, tell us at{" "}
        <a href="mailto:help.beforesell@gmail.com">help.beforesell@gmail.com</a>. We answer every email.
      </p>
    </BlogLayout>
  );
}

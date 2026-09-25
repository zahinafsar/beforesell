import { Metadata } from "next";
import Link from "next/link";
import { BlogLayout } from "@/components/blog-layout";
import { getPost } from "@/lib/blog";
import { generateBlogMetadata } from "@/lib/seo";

const post = getPost("request-a-product")!;

export const metadata: Metadata = generateBlogMetadata({ post, lang: "en" });

export default function Page() {
  return (
    <BlogLayout post={post} lang="en">
      <p className="lead">
        You know exactly what you want. A used iPhone 13 with good battery health. A study table that fits a small room. A
        second hand Yamaha FZ in Dhaka. You search, nothing matches, and you come back tomorrow to search again.
      </p>

      <p>
        Most marketplaces only work in one direction. Sellers post, buyers hunt. If the right seller has not posted yet, the buyer
        keeps checking and hoping. BeforeSell lets you flip that around with a <strong>buyer request</strong>.
      </p>

      <h2>What is a buyer request?</h2>
      <p>
        A buyer request is a short post that says what you want to buy. You write the product, the details that matter to you, your
        budget and your location. BeforeSell gives the request its own page with a link you can share. Sellers who open it and have
        the item tap <strong>&quot;I have this&quot;</strong> and start a chat with you.
      </p>
      <p>
        Plenty of people have a spare phone, an unused laptop or a bicycle in the corner that they never got around to listing. A
        clear request is often the nudge they need to finally sell it.
      </p>

      <h2>How to post a request</h2>
      <ol>
        <li>
          Go to <Link href="/post">Post Ad</Link> and choose <strong>Post to buy a product</strong>.
        </li>
        <li>Write a clear title, for example &quot;iPhone 13 128GB, battery above 85%&quot;.</li>
        <li>Add details such as model, condition, color and anything you will not compromise on.</li>
        <li>Pick a category and your location so sellers know where you are.</li>
        <li>Set a minimum and maximum budget, or leave it empty if you are flexible.</li>
        <li>Post it. Posting a request is free.</li>
      </ol>

      <h2>Get your request in front of sellers</h2>
      <p>
        Buyer requests are not listed publicly on the site. Only people with the link can see yours, so the next step is getting it
        to the right people.
      </p>
      <p>
        <strong>Share the link.</strong> Post it in your Facebook groups, send it to friends, or drop it in a WhatsApp chat. Someone
        always knows someone who is selling.
      </p>
      <p>
        <strong>Boost it.</strong> If you want more reach, boost the request the same way sellers boost their ads. Choose the
        audience, location, duration and daily budget, pay with bKash, and our team reviews and promotes it for you. A boost
        increases who sees your request. It does not guarantee a seller.
      </p>

      <h2>Write a request sellers want to answer</h2>
      <ul>
        <li>Be specific. &quot;Laptop&quot; gets vague replies. &quot;Laptop with 16GB RAM for video editing&quot; gets useful ones.</li>
        <li>Give a realistic budget. Check similar listings first so your range makes sense.</li>
        <li>Mention your deal breakers, such as no repaired screens or original box required.</li>
        <li>Reply quickly when sellers message you. Good offers do not wait long.</li>
        <li>Close the request once you have bought the item so sellers stop reaching out.</li>
      </ul>

      <h2>Stay safe when a seller replies</h2>
      <p>
        Treat every offer the way you would treat a listing. Ask for recent photos, meet in a public place, inspect the item before
        paying, and never send an advance payment to someone you have not met. Keep the conversation on BeforeSell messaging where
        possible. Our <Link href="/safety">safety tips</Link> cover the details.
      </p>

      <h2>Have something to sell instead?</h2>
      <p>
        If someone shares a request for an item you own, open it and tap &quot;I have this&quot;. You already know the buyer wants it
        and what they are willing to pay, which makes for a much faster sale.
      </p>
      <p>
        Ready to stop searching? <Link href="/requests/new">Post your buyer request on BeforeSell</Link> and let the sellers come to you.
      </p>
    </BlogLayout>
  );
}

import { Metadata } from "next";
import { BlogLayout } from "@/components/blog-layout";
import { getPost } from "@/lib/blog";
import { generateBlogMetadata } from "@/lib/seo";

const post = getPost("world-used-products-market")!;

export const metadata: Metadata = generateBlogMetadata({ post, lang: "en" });

export default function Page() {
  return (
    <BlogLayout post={post} lang="en">
      <p className="lead">
        Buying used is no longer something people do only when money is tight. A second hand phone can be the sensible phone. A used
        chair may be better made than a new one at the same price. A twenty-year-old camera can become popular again because someone
        on social media made it look fun.
      </p>

      <p>
        The world market for used products is busy, but it is hard to squeeze into one neat number. Cars, phones, clothes, furniture,
        books, tools, and collectibles all move through different markets. Some are sold by large refurbishers with warranties. Some
        change hands through a message between two people living a few streets apart.
      </p>

      <h2>Used shopping has become normal</h2>
      <p>
        One useful snapshot comes from <a href="https://www.ebayinc.com/recommerce-report/">eBay&apos;s 2025 Recommerce Report</a>.
        Its survey covered about 16,000 consumers across nine countries. Eighty-nine percent said they expected to spend the same or
        more on pre-owned goods, while 81 percent named saving money as a reason for buying used.
      </p>
      <p>
        This is eBay&apos;s own research, so it naturally looks at the market through eBay&apos;s customers. Still, the scale is hard to
        ignore. The company says pre-owned and refurbished goods have made up more than 40 percent of its total sales value since
        2024. Used products are not sitting in a forgotten corner of online shopping anymore.
      </p>

      <h2>Phones show where the market is going</h2>
      <p>
        Smartphones are one of the clearest examples because they are expensive, easy to resell, and replaced long before they stop
        working. The <a href="https://view.gsma.com/mobile-net-zero-2025/p/2">GSMA Mobile Net Zero 2025 report</a> says new smartphone
        sales fell 15 percent between 2021 and 2023, while sales of used and refurbished phones rose 15 percent. Nearly half of the
        consumers in its survey said they would consider a refurbished phone next time.
      </p>
      <p>
        That does not mean people have stopped wanting new phones. It means there is now a proper middle ground between buying the
        latest model and keeping a broken device. Trade-in programmes, repair shops, certified refurbishers, and person-to-person
        marketplaces all take part in that middle ground.
      </p>

      <h2>Clothes, furniture, and collectibles behave differently</h2>
      <p>
        Used fashion is driven by price, but style matters just as much. A jacket from an older collection may be more interesting
        than anything in a current shop. Furniture is much more local because delivery is expensive. Collectibles can travel across
        the world if the buyer wants one exact card, watch, record, or camera.
      </p>
      <p>
        This is why there may never be one marketplace that handles every used product equally well. Global platforms are good at
        rare items and standardised shipping. Local platforms are better when a buyer needs to inspect a laptop, collect a table, or
        meet a motorbike seller in person.
      </p>

      <h2>Repair is becoming part of the buying decision</h2>
      <p>
        A product holds more second hand value when spare parts are available and repair is realistic. Governments are starting to
        pay attention to this. The European Union&apos;s <a href="https://www.consilium.europa.eu/en/policies/right-to-repair-products/">right
        to repair rules</a> entered into force in July 2024. They give consumers stronger options to request repairs for products such
        as phones, washing machines, and vacuum cleaners when those products are covered by EU repair requirements.
      </p>
      <p>
        Repair rules do not instantly create a healthy resale market, but they can help products stay useful for longer. A phone with
        replaceable parts is easier to trust than one that becomes waste after a small failure. The same is true for appliances,
        bicycles, and tools.
      </p>

      <h2>The biggest problem is still trust</h2>
      <p>
        Used goods do not come out of identical boxes. Two phones with the same model name can have completely different battery
        health, repair history, and physical condition. Buyers worry about hidden faults or stolen products. Sellers worry about fake
        payments, endless bargaining, and strangers who never arrive.
      </p>
      <p>
        Marketplaces are responding with seller ratings, identity checks, protected payments, inspection services, and clearer
        condition labels. None of these systems is perfect. Good photos, honest descriptions, product records, and a sensible
        inspection still do most of the work.
      </p>

      <h2>What this means for Bangladesh</h2>
      <p>
        Bangladesh already has a strong culture of repairing and passing products on. Phones are repaired, furniture is rebuilt, and
        vehicles remain useful through several owners. Much of this trade still happens through local shops, personal contacts, and
        social media groups. Online marketplaces can make it easier to find the right buyer outside that small circle.
      </p>
      <p>
        The opportunity is not simply to put more listings online. The better opportunity is to make condition, price, location, and
        communication clearer. That is especially useful for people buying their first laptop, replacing a phone on a limited budget,
        or selling an appliance before moving home.
      </p>

      <h2>Where the market goes next</h2>
      <p>
        The used market will probably become less separate from ordinary retail. More new-product shops will offer trade-ins. More
        used products will come with short warranties or inspection reports. Local person-to-person selling will remain important
        because many products are too cheap, too large, or too specific for an international reseller.
      </p>
      <p>
        The basic reason people buy used has not changed. They want a useful product at a price that makes sense. Better search,
        clearer listings, and safer conversations simply make that old habit easier to carry online. You can see what people near you
        are selling by <a href="/search">browsing BeforeSell</a>.
      </p>
    </BlogLayout>
  );
}

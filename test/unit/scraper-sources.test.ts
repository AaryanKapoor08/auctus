import { describe, expect, it } from "vitest";
import { parseIsedBenefitsFinder } from "@/scraper/sources/business/ised-benefits-finder";
import { parseIsedSupports } from "@/scraper/sources/business/ised-supports";
import { parseEduCanada } from "@/scraper/sources/student/educanada";
import { parseIndigenousBursaries } from "@/scraper/sources/student/indigenous-bursaries";
import { parseNserc } from "@/scraper/sources/professor/nserc";
import { parseSshrc } from "@/scraper/sources/professor/sshrc";
import { SOURCES } from "@/scraper/sources";

describe("SOURCES registry", () => {
  it("registers all six locked sources", () => {
    expect(SOURCES.map((s) => s.id).sort()).toEqual(
      [
        "educanada",
        "indigenous-bursaries",
        "ised-benefits-finder",
        "ised-supports",
        "nserc",
        "sshrc",
      ].sort(),
    );
  });

  it("each source has a non-zero rate limit", () => {
    for (const source of SOURCES) {
      expect(source.rateLimitMs).toBeGreaterThan(0);
    }
  });
});

describe("parseIsedBenefitsFinder", () => {
  it("parses funding cards into ScrapedFunding rows", () => {
    const html = `
      <main>
        <div class="funding-card">
          <div class="funding-title"><a href="/funding/abc">Innovation Booster</a></div>
          <div class="funding-provider">ISED</div>
          <div class="funding-deadline">2026-09-30</div>
          <div class="funding-amount">$25,000 to $250,000</div>
          <div class="funding-summary">Support for SMEs adopting AI.</div>
          <span class="funding-tag">ai</span>
          <span class="funding-tag">sme</span>
        </div>
        <div class="funding-card">
          <div class="funding-title"><a href="https://innovation.ised-isde.canada.ca/funding/xyz">Export Builder</a></div>
          <div class="funding-provider">ISED</div>
          <div class="funding-deadline">Rolling</div>
          <div class="funding-amount">Up to $50,000</div>
        </div>
      </main>
    `;
    const baseUrl = "https://innovation.ised-isde.canada.ca/list";
    const items = parseIsedBenefitsFinder(html, baseUrl);
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe("Innovation Booster");
    expect(items[0].source_url).toBe("https://innovation.ised-isde.canada.ca/funding/abc");
    expect(items[0].amount_min).toBe(25_000);
    expect(items[0].amount_max).toBe(250_000);
    expect(items[0].deadline).toBe("2026-09-30");
    expect(items[0].tags).toEqual(["ai", "sme"]);
    expect(items[0].scraped_from).toBe(baseUrl);
    expect(items[0].type).toBe("business_grant");
    expect(items[1].deadline).toBe(null);
    expect(items[1].amount_max).toBe(50_000);
  });
});

describe("parseIsedSupports", () => {
  it("parses gc-card cards", () => {
    const html = `
      <a class="gc-card" href="/site/ised/en/programs/foo" data-amount="$10,000 - $100,000">
        <span class="card-title">Foo Program</span>
        <span class="card-provider">ISED</span>
        <span class="card-summary">Capital projects.</span>
        <span class="card-deadline">2026-08-15</span>
      </a>
    `;
    const items = parseIsedSupports(html, "https://ised-isde.canada.ca/site/ised/en/supports-for-business");
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("Foo Program");
    expect(items[0].amount_min).toBe(10_000);
    expect(items[0].amount_max).toBe(100_000);
    expect(items[0].deadline).toBe("2026-08-15");
    expect(items[0].source_url.startsWith("https://ised-isde.canada.ca")).toBe(true);
  });
});

describe("parseEduCanada", () => {
  it("parses scholarship-row table rows", () => {
    const html = `
      <table>
        <tr class="scholarship-row">
          <td class="name"><a href="/scholarships-bourses/foo.aspx">Foo Scholarship</a></td>
          <td class="provider">Global Affairs Canada</td>
          <td class="country">India</td>
          <td class="level">Doctoral</td>
          <td class="deadline">January 31, 2027</td>
          <td class="amount">$25,000</td>
        </tr>
      </table>
    `;
    const items = parseEduCanada(html, "https://www.educanada.ca/scholarships-bourses/non_can/index.aspx?lang=eng");
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("Foo Scholarship");
    expect(items[0].deadline).toBe("2027-01-31");
    expect(items[0].amount_max).toBe(25_000);
    expect(items[0].eligibility).toMatchObject({
      audience: "student",
      country: "India",
      education_level: "Doctoral",
    });
    expect(items[0].tags).toEqual(["India", "Doctoral"]);
    expect(items[0].type).toBe("scholarship");
  });
});

describe("parseIndigenousBursaries", () => {
  it("parses bursary list items", () => {
    const html = `
      <ul>
        <li class="bursary">
          <div class="bursary-title"><a href="/bursary/abc">Indigenous Education Bursary</a></div>
          <div class="bursary-org">Indspire</div>
          <div class="bursary-deadline">2026-09-01</div>
          <div class="bursary-amount">$5,000</div>
          <div class="bursary-eligibility">First Nations, Inuit, or Métis student</div>
        </li>
      </ul>
    `;
    const items = parseIndigenousBursaries(html, "https://sac-isc.gc.ca/eng/1351185180120/1351685455328");
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("Indigenous Education Bursary");
    expect(items[0].provider).toBe("Indspire");
    expect(items[0].amount_max).toBe(5_000);
    expect(items[0].tags).toContain("indigenous");
    expect(items[0].requirements).toEqual(["First Nations, Inuit, or Métis student"]);
  });
});

describe("parseNserc", () => {
  it("parses opportunity table rows", () => {
    const html = `
      <table>
        <tr class="opp">
          <td class="opp-name"><a href="/en/funding/discovery">Discovery Grant</a></td>
          <td class="opp-program">Discovery</td>
          <td class="opp-stage">Established</td>
          <td class="opp-deadline">2026-11-01</td>
          <td class="opp-amount">$25,000 - $100,000</td>
          <td class="opp-summary">Operating funding for established researchers.</td>
        </tr>
      </table>
    `;
    const items = parseNserc(html, "https://nserc.canada.ca/en/funding/funding-opportunity");
    expect(items).toHaveLength(1);
    expect(items[0].provider).toBe("NSERC");
    expect(items[0].deadline).toBe("2026-11-01");
    expect(items[0].amount_min).toBe(25_000);
    expect(items[0].amount_max).toBe(100_000);
    expect(items[0].eligibility).toMatchObject({
      audience: "professor",
      council: "NSERC",
      program: "Discovery",
      career_stage: "Established",
    });
    expect(items[0].tags).toEqual(["nserc", "Discovery"]);
  });
});

describe("parseSshrc", () => {
  it("parses opportunity panels", () => {
    const html = `
      <section>
        <div class="opportunity">
          <h3><a href="/en/funding/opportunities/insight">Insight Grant</a></h3>
          <div class="opportunity-program">Insight</div>
          <div class="opportunity-discipline">Humanities</div>
          <div class="opportunity-deadline">2026-10-15</div>
          <div class="opportunity-amount">Up to $400,000</div>
          <div class="opportunity-summary">Support for humanities research.</div>
        </div>
      </section>
    `;
    const items = parseSshrc(html, "https://sshrc-crsh.canada.ca/en/funding/opportunities.aspx");
    expect(items).toHaveLength(1);
    expect(items[0].provider).toBe("SSHRC");
    expect(items[0].deadline).toBe("2026-10-15");
    expect(items[0].amount_max).toBe(400_000);
    expect(items[0].tags).toEqual(["sshrc", "Humanities"]);
  });
});

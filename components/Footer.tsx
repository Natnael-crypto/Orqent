import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: ["Chat Widgets", "Analytics", "Integrations", "API", "Pricing"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Guides", "Blog", "Changelog", "Status"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Press", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Security", "GDPR"],
  },
];

const Footer = () => (
  <footer className="section-padding py-20 border-t border-border bg-subtle">
    <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
      <div className="col-span-2 md:col-span-1">
        <Link href="/" className="text-xl font-medium tracking-tight">Orqent</Link>
        <p className="mt-3 text-sm text-muted-foreground font-light max-w-xs">
          AI-powered chat widgets for modern products.
        </p>
      </div>
      {columns.map((col) => (
        <div key={col.title}>
          <p className="text-sm text-muted-foreground mb-4">{col.title}</p>
          <ul className="space-y-2.5">
            {col.links.map((link) => (
              <li key={link}>
                <a href="#" className="text-sm text-foreground/70 hover:text-foreground transition-colors">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-xs text-muted-foreground">© 2026 Orqent, Inc. All rights reserved.</p>
      <div className="flex items-center gap-6">
        <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
        <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a>
        <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
      </div>
    </div>
  </footer>
);

export default Footer;

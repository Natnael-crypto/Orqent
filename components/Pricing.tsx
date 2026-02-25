"use client"

import { useState } from "react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/month",
    description: "For individual developers exploring AI chat.",
    features: ["1 chat widget", "1,000 messages/mo", "Basic analytics", "Community support"],
    cta: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing teams that need more power.",
    features: ["10 chat widgets", "50,000 messages/mo", "Advanced analytics", "Priority support", "Custom branding", "API access"],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations with advanced requirements.",
    features: ["Unlimited widgets", "Unlimited messages", "Dedicated infrastructure", "SSO & SAML", "SLA guarantee", "Dedicated CSM"],
    cta: "Contact sales",
    highlighted: false,
  },
];

const Pricing = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="section-padding py-20 md:py-32">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-light tracking-tight">Simple, transparent pricing.</h2>
        <p className="mt-4 text-muted-foreground font-light">Start free. Scale as you grow.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className={`text-sm ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`w-10 h-5 rounded-full relative transition-colors ${annual ? "bg-foreground" : "bg-border"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform ${annual ? "left-5" : "left-0.5"}`} />
          </button>
          <span className={`text-sm ${annual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-8 flex flex-col ${plan.highlighted ? "bg-subtle" : "bg-background"} ${plan.name !== "Enterprise" ? "border-r border-border" : ""}`}
          >
            <p className="text-sm font-medium text-foreground">{plan.name}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-light tracking-tight">{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.period}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
            <ul className="mt-6 space-y-2.5 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="mt-1 w-1 h-1 rounded-full bg-foreground/40 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`mt-8 w-full py-2.5 text-sm font-medium rounded-full transition-colors ${plan.highlighted
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "border border-border text-foreground hover:bg-secondary"
                }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;

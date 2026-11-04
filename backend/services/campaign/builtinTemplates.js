/*
  Ready-made campaign templates. Admins can pick one, tweak it in the editor, or
  save their own copy. They use the placeholders documented in render.js.
*/

const shell = (inner) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{headline}}</title></head>
<body style="margin:0;padding:0;background:#fafaf9;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{preheader}}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafaf9;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
<tr><td style="background:#ea580c;padding:18px 28px;"><a href="{{siteUrl}}" style="font-size:20px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:.02em;">Target Trek</a></td></tr>
${inner}
<tr><td style="padding:20px 28px;background:#fafaf9;border-top:1px solid #e7e5e4;font-size:12px;line-height:1.6;color:#78716c;">
You are receiving this because you are a Target Trek customer.<br>
<a href="{{unsubscribeUrl}}" style="color:#78716c;">Unsubscribe</a> · <a href="{{siteUrl}}" style="color:#78716c;">targettrek.in</a>
</td></tr>
</table></td></tr></table></body></html>`;

const body = (inner) => `<tr><td style="padding:30px 28px 8px;">${inner}</td></tr>`;

const heading = `<h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:#1c1917;">{{headline}}</h1>
<p style="margin:0 0 14px;font-size:15px;color:#44403c;">Hi {{firstName}},</p>`;

export const BUILTIN_TEMPLATES = [
  {
    key: "new-book",
    name: "New book launch",
    category: "announcement",
    description: "Announce a new book or product with cards for the featured books.",
    subject: "New from Target Trek: {{headline}}",
    defaults: {
      headline: "Our new book is here",
      body: "We just launched something we think you will love.\n\nPick it up today and keep your preparation moving.",
      ctaText: "Explore the books",
    },
    html: shell(body(`${heading}{{{message}}}{{{products}}}{{{coupon}}}{{{button}}}`)),
  },
  {
    key: "coupon-offer",
    name: "Discount coupon",
    category: "promotion",
    description: "A coupon code front and centre, with a button to the store.",
    subject: "{{couponDiscount}} for you, {{firstName}}",
    defaults: {
      headline: "A little something for you",
      body: "As a thank-you for being part of Target Trek, here is a special coupon on our books.\n\nUse it at checkout before it expires.",
      ctaText: "Use my coupon",
    },
    html: shell(body(`${heading}{{{message}}}{{{coupon}}}{{{button}}}{{{products}}}`)),
  },
  {
    key: "cross-sell",
    name: "You bought X, you will love Y",
    category: "cross-sell",
    description: "Recommend other books to people who already own one of ours, with a coupon.",
    subject: "Since you picked up {{purchasedBooks}}...",
    defaults: {
      headline: "The perfect next read",
      body: "You already own {{purchasedBooks}}. Readers like you usually go on to these next.\n\nHere is a coupon to make the next step easier.",
      ctaText: "See recommendations",
    },
    html: shell(
      body(`${heading}<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#44403c;">Thank you for choosing <b>{{purchasedBooks}}</b>. Readers like you usually go on to these next:</p>{{{message}}}{{{products}}}{{{coupon}}}{{{button}}}`)
    ),
  },
  {
    key: "win-back",
    name: "We miss you",
    category: "re-engagement",
    description: "Bring back registered users who have not bought yet, or old customers.",
    subject: "{{firstName}}, we saved something for you",
    defaults: {
      headline: "We have not seen you in a while",
      body: "Interview season waits for no one. We have added new material since your last visit.\n\nCome back with a coupon on us.",
      ctaText: "Take a look",
    },
    html: shell(body(`${heading}{{{message}}}{{{coupon}}}{{{button}}}`)),
  },
  {
    key: "flash-sale",
    name: "Flash sale",
    category: "promotion",
    description: "Loud sale banner with the coupon and featured books.",
    subject: "Flash sale: {{couponDiscount}} on selected books",
    defaults: {
      headline: "Flash sale is live",
      body: "For a limited time only, our best-selling interview books are on offer.\n\nGrab yours before the sale ends.",
      ctaText: "Shop the sale",
    },
    html: shell(
      `<tr><td align="center" style="background:#1c1917;padding:30px 28px;"><div style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#fdba74;font-weight:700;">Limited time</div><div style="margin-top:8px;font-size:30px;font-weight:800;color:#ffffff;">{{headline}}</div></td></tr>` +
        body(`<p style="margin:0 0 14px;font-size:15px;color:#44403c;">Hi {{firstName}},</p>{{{message}}}{{{coupon}}}{{{products}}}{{{button}}}`)
    ),
  },
  {
    key: "plain-message",
    name: "Simple message",
    category: "announcement",
    description: "Clean text-only email for notices and updates.",
    subject: "{{headline}}",
    defaults: { headline: "An update from Target Trek", body: "Write your message here.", ctaText: "" },
    html: shell(body(`${heading}{{{message}}}{{{button}}}`)),
  },
];

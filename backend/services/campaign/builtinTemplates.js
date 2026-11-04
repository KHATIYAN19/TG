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


/*
  Edge-to-edge layout (no outer margin, just a little side padding) written like a
  personal / transactional message: one column, one main button, no heavy banners
  or image-only blocks. That reads as a normal email to inbox filters instead of a
  promotion.
*/
const flushShell = (inner) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{headline}}</title>
<style>
/* Progressive enhancement: Apple Mail / iOS / most webmail apps animate; clients that strip CSS just show the static email. */
@keyframes ttUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes ttPulse{0%{box-shadow:0 0 0 0 rgba(234,88,12,.45)}70%{box-shadow:0 0 0 14px rgba(234,88,12,0)}100%{box-shadow:0 0 0 0 rgba(234,88,12,0)}}
@keyframes ttPop{0%{transform:scale(.96)}50%{transform:scale(1.04)}100%{transform:scale(.96)}}
@keyframes ttBlink{0%,80%,100%{opacity:.25}40%{opacity:1}}
@keyframes ttMsg{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}
@keyframes ttShine{0%{background-position:-200% 0}100%{background-position:200% 0}}
.tt-up{animation:ttUp .7s ease-out both}
.tt-d1{animation-delay:.15s}.tt-d2{animation-delay:.3s}.tt-d3{animation-delay:.45s}
.tt-pulse{animation:ttPulse 2s infinite}
.tt-pop{animation:ttPop 2.4s ease-in-out infinite}
.tt-dot{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:3px;background:#78716c;animation:ttBlink 1.3s infinite}
.tt-dot2{animation-delay:.2s}.tt-dot3{animation-delay:.4s}
.tt-m1{animation:ttMsg .5s ease-out .2s both}.tt-m2{animation:ttMsg .5s ease-out 1s both}.tt-m3{animation:ttMsg .5s ease-out 1.8s both}.tt-m4{animation:ttMsg .5s ease-out 2.6s both}
.tt-shine{background-image:linear-gradient(110deg,#ea580c 30%,#fb923c 50%,#ea580c 70%);background-size:200% 100%;animation:ttShine 3s linear infinite}
@media (prefers-reduced-motion:reduce){.tt-up,.tt-pulse,.tt-pop,.tt-dot,.tt-m1,.tt-m2,.tt-m3,.tt-m4,.tt-shine{animation:none!important}}
</style>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#292524;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{{preheader}}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:0;border-collapse:collapse;"><tr><td align="center" style="padding:0;margin:0;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:640px;margin:0;border-collapse:collapse;">
${inner}
<tr><td style="padding:22px 16px 28px;border-top:1px solid #e7e5e4;font-size:12px;line-height:1.6;color:#78716c;">
You are receiving this because you purchased {{purchasedBooks}} from Target Trek.<br>
<a href="{{unsubscribeUrl}}" style="color:#78716c;">Unsubscribe</a> &nbsp;·&nbsp; <a href="{{siteUrl}}" style="color:#78716c;">targettrek.in</a>
</td></tr>
</table></td></tr></table></body></html>`;

const li = (title, text) =>
  `<tr><td valign="top" width="26" style="padding:0 0 12px;font-size:16px;line-height:22px;color:#ea580c;font-weight:700;">&#10003;</td><td style="padding:0 0 12px;font-size:15px;line-height:1.55;color:#44403c;"><b style="color:#1c1917;">${title}</b> ${text}</td></tr>`;

const step = (n, title, text) =>
  `<tr><td valign="top" width="34" style="padding:0 0 14px;"><div style="width:26px;height:26px;border-radius:13px;background:#1c1917;color:#ffffff;font-size:13px;font-weight:700;line-height:26px;text-align:center;">${n}</div></td><td style="padding:0 0 14px;font-size:15px;line-height:1.55;color:#44403c;"><b style="color:#1c1917;">${title}</b><br>${text}</td></tr>`;

const PREP_BUDDY_HTML = flushShell(`
<tr><td style="padding:22px 16px 6px;">
  <p class="tt-up" style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#44403c;">Hi {{firstName}},</p>
  <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#44403c;">Thank you for purchasing <b style="color:#1c1917;">{{purchasedBooks}}</b>. Because you are already part of Target Trek, you are among the first people we are inviting to our new platform.</p>
  <h1 class="tt-up tt-d1" style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#1c1917;">{{headline}}</h1>
  <p style="margin:0 0 6px;font-size:15px;line-height:1.6;color:#44403c;">Prep Buddy matches you with another serious candidate preparing for the same kind of interviews, so you can practise together, hold each other accountable and learn what actually gets asked.</p>
</td></tr>


<tr><td style="padding:18px 16px 4px;">
  <h2 style="margin:0 0 10px;font-size:19px;line-height:1.3;color:#1c1917;">So, what is Prep Buddy?</h2>
  <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#44403c;">Preparing alone is hard to keep up. Prep Buddy is a members-only space on Target Trek where you are paired with <b style="color:#1c1917;">one other candidate</b> aiming for similar roles. You choose each other based on level, topics and target companies, then prepare as a team: mock interviews, doubt-solving and weekly check-ins.</p>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:separate;border-spacing:6px 0;margin:0 -6px;">
    <tr>
      <td class="tt-up" align="center" style="width:33%;padding:12px 4px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:10px;"><div style="font-size:22px;font-weight:800;color:#c2410c;">2</div><div style="font-size:12px;color:#57534e;">buddy matches</div></td>
      <td class="tt-up tt-d1" align="center" style="width:33%;padding:12px 4px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:10px;"><div style="font-size:22px;font-weight:800;color:#c2410c;">Live</div><div style="font-size:12px;color:#57534e;">private chat</div></td>
      <td class="tt-up tt-d2" align="center" style="width:33%;padding:12px 4px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:10px;"><div style="font-size:22px;font-weight:800;color:#c2410c;">&#8377;29</div><div style="font-size:12px;color:#57534e;">for readers</div></td>
    </tr>
  </table>
</td></tr>

<tr><td style="padding:22px 16px 4px;">
  <h2 style="margin:0 0 10px;font-size:19px;line-height:1.3;color:#1c1917;">Live chat with your buddy</h2>
  <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#44403c;">Once you match, you get a private real-time chat, right inside the platform. No sharing phone numbers just to say hello.</p>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;background:#f5f5f4;border-radius:14px;">
    <tr><td style="padding:14px 12px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a8a29e;margin-bottom:10px;"><span style="display:inline-block;width:8px;height:8px;border-radius:4px;background:#22c55e;margin-right:6px;"></span>Your buddy is online</div>
      <div class="tt-m1" style="margin:0 0 8px;"><span style="display:inline-block;max-width:80%;padding:9px 13px;border-radius:14px 14px 14px 4px;background:#ffffff;border:1px solid #e7e5e4;font-size:14px;line-height:1.45;color:#292524;">Hey! Free tonight for a system design mock? I will take the interviewer seat first.</span></div>
      <div class="tt-m2" style="margin:0 0 8px;text-align:right;"><span style="display:inline-block;max-width:80%;padding:9px 13px;border-radius:14px 14px 4px 14px;background:#ea580c;font-size:14px;line-height:1.45;color:#ffffff;">Yes! 9 pm works. Let us do a URL shortener.</span></div>
      <div class="tt-m3" style="margin:0 0 8px;"><span style="display:inline-block;max-width:80%;padding:9px 13px;border-radius:14px 14px 14px 4px;background:#ffffff;border:1px solid #e7e5e4;font-size:14px;line-height:1.45;color:#292524;">Perfect. I will share feedback right after.</span></div>
      <div class="tt-m4" style="margin:0;text-align:right;"><span style="display:inline-block;padding:10px 14px;border-radius:14px 14px 4px 14px;background:#e7e5e4;"><span class="tt-dot"></span><span class="tt-dot tt-dot2"></span><span class="tt-dot tt-dot3"></span></span></div>
    </td></tr>
  </table>
  <p style="margin:10px 0 0;font-size:12px;color:#78716c;">Example conversation for illustration.</p>
</td></tr>

<tr><td style="padding:22px 16px 4px;">
  <h2 style="margin:0 0 10px;font-size:19px;line-height:1.3;color:#1c1917;">Built to be safe</h2>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;">
    ${li("You appear under an alias.", "Your real name, phone and email stay hidden until you match and choose to share them.")}
    ${li("You choose who you talk to.", "Nobody can message you without a request that you accept.")}
    ${li("Block and report.", "If someone makes you uncomfortable, block or report them in one tap. Reports are reviewed by our team.")}
    ${li("One partner at a time.", "Chats are one-to-one and private, not open groups.")}
    ${li("Secure payment.", "Payment goes through trusted payment gateways. We never see your card or UPI details.")}
    ${li("We are new, and growing with you.", "We are still onboarding members and adding features, so your feedback shapes what we build next.")}
  </table>
</td></tr>

<tr><td style="padding:14px 16px 6px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;background:#fff7ed;border:1px solid #fdba74;border-radius:12px;">
    <tr><td style="padding:18px 16px;text-align:center;">
      <div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#9a3412;font-weight:700;">Your price as an existing reader</div>
      <div style="margin:8px 0 2px;font-size:15px;color:#78716c;">Regular price <span style="text-decoration:line-through;">&#8377;199</span></div>
      <div class="tt-pop" style="font-size:44px;line-height:1.1;font-weight:800;color:#c2410c;">&#8377;29</div>
      <div style="margin:4px 0 14px;font-size:14px;color:#44403c;">with 2 matches included</div>
      <div class="tt-pulse" style="display:inline-block;padding:10px 20px;border:2px dashed #ea580c;border-radius:10px;background:#ffffff;font-family:Menlo,Consolas,monospace;font-size:22px;font-weight:800;letter-spacing:.1em;color:#c2410c;">TTNEW29</div>
      <div style="margin-top:8px;font-size:12px;color:#78716c;">Enter this code at checkout. Added to your account for you, no need to hunt for it.</div>
    </td></tr>
  </table>
</td></tr>

<tr><td align="center" style="padding:18px 16px 8px;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;"><tr><td class="tt-shine" style="border-radius:10px;background:#ea580c;"><a href="{{ctaUrl}}" style="display:inline-block;padding:14px 30px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">{{ctaText}}</a></td></tr></table>
</td></tr>

<tr><td style="padding:22px 16px 4px;">
  <h2 style="margin:0 0 12px;font-size:19px;line-height:1.3;color:#1c1917;">What you get</h2>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;">
    ${li("2 buddy matches.", "One entry gives you 2 partnerships in total, one after another, each with a private chat.")}
    ${li("A profile built for interviews.", "Your level, topics, skills, target companies and availability, so matches are relevant.")}
    ${li("Browse and choose.", "See other members, send requests, accept the ones that fit.")}
    ${li("Privacy first.", "Your name and contact details stay hidden until you match and decide to share them.")}
  </table>
</td></tr>

<tr><td style="padding:14px 16px 4px;">
  <h2 style="margin:0 0 12px;font-size:19px;line-height:1.3;color:#1c1917;">How the program works</h2>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;">
    ${step(1, "Create your profile", "Takes about two minutes. Sign in with the same email you used for {{purchasedBooks}}.")}
    ${step(2, "Join with code TTNEW29", "Pay &#8377;29 instead of &#8377;199 and your profile goes live in the arena.")}
    ${step(3, "Find your buddy", "Browse members, send requests or accept the ones you receive.")}
    ${step(4, "Practise together", "Chat privately, schedule mock interviews, share what you learn and keep each other consistent.")}
    ${step(5, "Use your second match", "When the first partnership ends, your second match is ready, so you can practise with someone new.")}
  </table>
</td></tr>

<tr><td style="padding:10px 16px 6px;">
  <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#57534e;">We are onboarding members in batches, and this price is only for people who already bought from us. Need help? Just reply to this email.</p>
  <p style="margin:0;font-size:15px;line-height:1.6;color:#44403c;">Thanks again for learning with Target Trek,<br><b style="color:#1c1917;">Team Target Trek</b></p>
</td></tr>
`);

export const BUILTIN_TEMPLATES = [
  {
    key: "prep-buddy-launch",
    name: "Prep Buddy invite (existing readers)",
    category: "launch",
    description: "Invites past buyers to Prep Buddy: \u20b9199 \u2192 \u20b929 with code TTNEW29 and 2 matches. Edge-to-edge, personal tone to stay out of Promotions.",
    subject: "Thanks for buying {{purchasedBooks}}, {{firstName}}: your Prep Buddy invite",
    defaults: {
      headline: "Find a prep buddy for your interviews",
      ctaText: "Join Prep Buddy for \u20b929",
      ctaUrl: "https://www.targettrek.in/prep-buddy",
      couponCode: "TTNEW29",
      preheader: "Because you bought from us, you get Prep Buddy for \u20b929 instead of \u20b9199, with 2 matches.",
    },
    html: PREP_BUDDY_HTML,
  },
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

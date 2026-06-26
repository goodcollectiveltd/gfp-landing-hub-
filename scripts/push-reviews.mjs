// One-off: load the Quote & Review Bank — (a) the doc into knowledge_docs, and
// (b) the 12 structured reviews into the reviews table, photos linked.
// Idempotent. Run with SB_TOKEN + PROJECT_REF env.
import { readFileSync } from "fs";

const TOKEN = process.env.SB_TOKEN;
const REF = process.env.PROJECT_REF;
const DOC_FILE = "C:/Users/will/Downloads/5-Strain-Probiotic-Plus-Quote-Review-Bank.md";
const DOC_TITLE = "5 Strain Probiotic+ — Quote & Review Bank";
const docContent = readFileSync(DOC_FILE, "utf8");

const reviews = [
  { name: "Julie C.", body: `I started these on the 24th January 2025 and today I actually saw a difference, no more paw licking or chewing. I cleaned her ears out today and nothing in there either. A much more relaxed and happy dog, thank you.`, images: ["https://goodforpets.co/cdn/shop/files/gempages_532942876443673607-bab6c950-c980-430a-add2-828a060f5962.webp?v=1728920991"] },
  { name: "Chris Brooks", body: `This works. I tried everything. My bulldog, for two and a half years every summer, licked her paws bald and raw. The vet stuff was £140 for two weeks and nothing worked. This is £33 including delivery and lasts about two months. Took a week to start working but she's not licked for three weeks now. DM me if you don't believe me, I don't work for these guys, I just wanted to tell people.`, images: ["https://goodforpets.co/cdn/shop/files/bulldog-1.jpg?v=1749813817"] },
  { name: "Joanne East", body: `Such a happy doggo! My cockapoo has been on the 5 Strain Probiotic for a year now. When we first started, she chewed her paws and was constantly licking and scratching her ears. We were advised to give it a few months before seeing any noticeable change, and after 12 to 14 weeks I noticed a huge change. She stopped chewing her paws and scratching her ears, and her ears are clean and healthy too. She has regular solid stools and seems a lot happier in herself. Good For Pets have certainly made a big difference, so thank you!`, images: [] },
  { name: "Katie S.", body: `My dog was on the baked chews but saw the advert saying non-baked chews are better. She was still having itchy ears on the baked chews. Two and a half weeks on these and the difference is already massive. Since I adopted her in 2018 I've spent so much on steroids, ear drops and ear cleaning at the vet. Her ears are now practically clean and there's no itching at all.`, images: ["https://assets.replocdn.com/projects/65d6d0f1-8a11-479b-aa6b-02d837ab1f77/439ce5de-97e4-4f8a-84a6-a95efe4933b0"] },
  { name: "Pug Rolo's owner", body: `Our pug Rolo suffers from multiple allergies, both food and environmental, and we'd tried everything to ease his itching. I was sceptical that a probiotic could help, but after a few weeks his skin isn't itchy anymore, his coat looks amazing and he's far more comfortable overall. We've even been able to reduce his medication to just occasional flare ups.`, images: [] },
  { name: "Tanya S.", body: `These are brilliant. I had my boy on the baked alternative prior to seeing these and they slightly helped his ear problems. These are another level completely. What a difference they have made. They also last me four weeks instead of three, a wee save for my pocket too. Win, win.`, images: ["https://goodforpets.co/cdn/shop/files/gempages_532942876443673607-7acd10fa-4a53-43a4-b8b8-09eb27d3065f.jpg?v=1737307002"] },
  { name: "Nicola G.", body: `I have been using these for the past three weeks for my old English Mastiff and they have made a big difference already to her ears, skin and paws. Also her poo is now normal. These tablets have been a blessing.`, images: ["https://goodforpets.co/cdn/shop/files/gempages_532942876443673607-c2c5318f-ba76-4afa-baf4-8db5fa167597.jpg?v=1749813874"] },
  { name: "Gareth Nibbs", body: `My Staffy was eating cat poo at about 8 months old, his energy was killed off and his breath turned to an ammonia smell. We got these tablets to help him, and he went from that and chewing and licking his paw to being a healthy, happy, energetic dog. He's still on them and enjoys eating them. For anyone on the fence, no need to be skeptical. Thank you from myself, my wife and most importantly Mr Zuchi.`, images: ["https://goodforpets.co/cdn/shop/files/496846852_9778317798915730_4936121045582222097_n_1.jpg?v=1749813997"] },
  { name: "Elmo's owner", body: `I inherited an 8-year-old rescue dog, Elmo. He was loose but still had a good appetite. Within four days he was firm, more settled and happier in himself.`, images: [] },
  { name: "Elaine Conway", body: `I've been giving these to our yellow Lab for just over a month and the difference is incredible. Her ears are the best they've been in ages, no more scooting or grass eating, and her eyes are clearer with less tear staining. She's full of energy again, like a younger version of herself. Our fussy girl needs a bit of pate to take them but it's worth it. I've started giving them to our one year old too and she's stopped eating grass and seems much more settled. Can't recommend these enough.`, images: ["https://goodforpets.co/cdn/shop/files/elaineconwylabs.jpg?v=1763050161"] },
  { name: "Christine H.", body: `Tilly's been on these for four months and the difference is remarkable. Her eyes no longer have that horrible brown staining and she doesn't need her gland emptied as often. We've halved our trips to the vet. She's so much more comfortable in herself. She's 7 years old, a three-legged rescue from Romania, and she's never felt better.`, images: ["https://assets.replocdn.com/projects/65d6d0f1-8a11-479b-aa6b-02d837ab1f77/124bfee6-ef9e-4311-8903-aed81d95a5b1"] },
  { name: "Sherry B.", body: `I originally bought these for one of my Pomeranians who had a bad yeast issue and lost his coat. I'd tried many others but nothing helped until I tried Good For Pets. He now has his full coat back. I then gave them to my other Pom for her tummy upsets and she's had nothing since. It's been a year. Wouldn't give them anything else.`, images: ["https://assets.replocdn.com/projects/65d6d0f1-8a11-479b-aa6b-02d837ab1f77/c5015a05-3d63-45d2-bc67-d8c9d12e52e0"] },
];

const brandSub = `(select id from public.brand_kits where name = $bn$Good For Pets$bn$ limit 1)`;

const reviewRows = reviews
  .map(
    (r, i) =>
      `  ($a${i}$${r.name}$a${i}$, $b${i}$${r.body}$b${i}$, $i${i}$${JSON.stringify(r.images)}$i${i}$)`
  )
  .join(",\n");

const sql = `
-- (a) Context Hub doc (idempotent)
delete from public.knowledge_docs
 where brand_id = ${brandSub} and title = $dt$${DOC_TITLE}$dt$;
insert into public.knowledge_docs (brand_id, title, tag, content)
select ${brandSub}, $dt$${DOC_TITLE}$dt$, 'proof', $dc$${docContent}$dc$;

-- (b) Reviews (idempotent on source)
delete from public.reviews where brand_id = ${brandSub} and source = 'review-bank';
insert into public.reviews (brand_id, author, rating, body, product, images, source)
select b.id, v.author, 5, v.body, '5 Strain Probiotic+', v.images::jsonb, 'review-bank'
from ${brandSub} b
cross join (values
${reviewRows}
) as v(author, body, images);

select
  (select count(*) from public.reviews where brand_id = ${brandSub}) as reviews,
  (select count(*) from public.reviews where brand_id = ${brandSub} and jsonb_array_length(images) > 0) as with_photo,
  (select count(*) from public.knowledge_docs where brand_id = ${brandSub}) as docs;
`;

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
console.log("HTTP", res.status);
console.log(await res.text());

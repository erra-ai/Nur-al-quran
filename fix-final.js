const fs=require('fs');
const file=String.raw`C:\Users\Dell\Downloads\Quran and Hadith lesson\app.html`;
let src=fs.readFileSync(file,'utf8');

const fixes=[
  // 1. Every Letter Q8 (gap=11)
  ['"No — only perfect reading gets any reward at all", "Struggling readers only get half the reward each time", "You must read perfectly before getting any reward"',
   '"No — only those who read perfectly without any mistakes deserve to receive any reward from Allah at all for their recitation", "Struggling readers only get half the reward because their pronunciation is not correct and Allah values perfection over effort every single time", "You must read perfectly and fluently before getting any reward — anyone who stumbles on even one letter gets absolutely nothing from Allah whatsoever"'],

  // 2. First Deed is Prayer Q9 (gap=9)
  ['"At birth — you must pray from the first day", "At eighteen years old like all other duties", "Salah is never obligatory for anyone at all"',
   '"At birth — you must pray from the very first day of life because every human is born Muslim and knowing how to worship", "At eighteen years old like all other duties in life — until then children have no religious responsibilities at all whatsoever", "Salah is never obligatory for anyone at any age — it is just a recommended practice that people can choose to do if they wish"'],

  // 3. Pray as You Seen Me Q8 (gap=8)
  ['"Tell them they are wrong immediately", "Ignore them and never talk about prayer at all", "Everyone must pray exactly the same as you alone"',
   '"Tell them they are completely wrong immediately without asking for any evidence or scholarly opinion on the matter at all", "Ignore them and never talk about prayer or discuss the differences with anyone under any circumstances at all", "Everyone must pray exactly the same as you and your mosque alone — there is only one valid way to perform every single movement"'],

  // 4. Pray as You Seen Me Q9 (gap=7)
  ['"Nothing special because everyone prays the same way", "Prayer has no connection to the Prophet at all", "Only scholars feel connected to the Prophet in prayer"',
   '"Nothing special at all because everyone prays the same way and there is nothing meaningful about following the Prophetic way of praying", "Prayer has no connection to the Prophet — it is just a set of movements that people invented over the centuries without any link to him", "Only scholars and imams feel any connection to the Prophet in prayer — ordinary people just go through the motions without any spiritual link"'],

  // 5. Mercy to Young Q9 (gap=6)
  ['"Join in because the older kids are stronger than you", "Ignore it because it is not your business at all", "Only teachers should care about younger students"',
   '"Join in because the older kids are stronger than you and you should always side with whoever has more power in any situation that arises", "Ignore it because it is not your business at all — mercy and compassion are only for your own family members and close personal friends", "Only teachers and school staff should care about younger students — children and other students have no responsibility toward each other"'],

  // 6. Pray as You Seen Me Q6 (gap=6)
  ['"Your friend is correct and you can pray any way", "Only the direction of qibla matters at all", "The hadith does not talk about how to pray here"',
   '"Your friend is correct and you can pray any way you like as long as your heart is sincere and you face the right direction of qibla", "Only the direction of qibla matters at all — everything else about prayer is flexible and can be changed according to personal preference", "The hadith does not talk about how to pray here — it only mentions prayer in passing without giving any specific instructions about the method"'],

  // 7. Fasting Q9 (gap=5)
  ['"The angels give exactly ten times the reward", "The Prophet \uFDFA gives the reward on Qiyamah", "Fasting has no special reward different from prayer"',
   '"The angels give exactly ten times the reward for fasting just as they do for every other good deed and action a person performs in this life", "The Prophet \uFDFA himself gives the reward on the Day of Judgment based on his own judgment and discretion rather than Allah giving it directly", "Fasting has no special reward that is any different from prayer or charity — every good deed is rewarded in exactly the same way without exception"'],

  // 8. Fasting Q4 (gap=3)
  ['"The Prophet \uFDFA speaking on his own opinion", "The angel Jibreel speaking to the Prophet", "Abu Hurairah explaining in his own words"',
   '"The Prophet \uFDFA speaking on his own opinion and personal understanding of the matter rather than conveying words directly from Allah", "The angel Jibreel speaking to the Prophet with his own words rather than conveying a direct quotation from Allah Himself to the believers", "Abu Hurairah explaining in his own words what he thought the Prophet meant rather than preserving the exact wording of the original statement precisely"'],

  // 9. Pray as You Seen Me Q7 (gap=3)
  ['"Learning to pray as fast as possible every time", "Making up your own movements and your own words", "Praying only when you feel like it and not regularly"',
   '"Learning to pray as fast as possible every single time so you can finish quickly and move on to other activities in your daily routine", "Making up your own movements and your own words as you go along because prayer is flexible and can be adapted to whatever feels right", "Praying only when you feel like it and not regularly — consistency and schedule are not important as long as your intention is good"'],

  // 10. Az-Zalzalah Q7 (gap=2) — vocab, just add words
  ['"a mountain", "an ocean", "a forest"',
   '"a great mountain", "a wide ocean", "a dense forest"'],

  // 11. Learn and Teach Q7 (gap=2)
  ['"No special rank at all because it is a small surah", "Teaching only counts for long surahs, not short ones", "You need a special certificate to teach anyone Qur\'an"',
   '"No special rank at all because it is only a small surah — only teaching the longer surahs brings any real reward from Allah", "Teaching only counts for long surahs and not short ones — the reward is proportional to the length and difficulty of what you teach", "You need a special certificate or ijazah to teach anyone the Qur\'an — without formal authorization your teaching has no value or reward"'],

  // 12. Pray as You Seen Me Q5 (gap=2)
  ['"Prophet \uFDFA -> random people -> anyone today", "Each person learns directly from an angel now", "There is actually no chain of transmission for prayer"',
   '"Prophet \uFDFA -> random unqualified people -> anyone today without any verification or authentication of what was actually taught along the way", "Each person learns directly from an angel now — every single Muslim receives individual private instruction from the angels about how to pray correctly", "There is actually no reliable chain of transmission for prayer — we simply do not know how the Prophet prayed and everything is just guesswork"'],
];

let count=0;
for(const[old,newStr] of fixes){
  if(src.includes(old)){
    src=src.replace(old,newStr);
    count++;
  }else{
    console.log('NOT FOUND: '+old.substring(0,70));
  }
}

fs.writeFileSync(file,src);
console.log(`Fixed ${count}/${fixes.length}.`);

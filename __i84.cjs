const path=require('path');
const base=String.raw`C:\Users\Dell\Downloads\Quran and Hadith lesson`;
const {surahs}=require(path.join(base,'lesson-data-loader.js')).loadLessonData();
const m=surahs.find(s=>s.number===84);
console.log('keys:',Object.keys(m).join(', '));
console.log('intro len:',(m.intro||'').length,'introVerified:',m.introVerified?'yes':'NO');
console.log('vocab:',m.vocabulary.length,'practice:',m.practice.length,'quiz:',m.quiz.length);
console.log('fillBlanks ayahs:',m.fillBlanks?.ayahs?.length,'fillBlanksEn ayahs:',m.fillBlanksEn?.ayahs?.length);
console.log('');
console.log('--- vocabulary (arabic | meaning | verified.by) ---');
m.vocabulary.forEach((v,i)=>{
  const g=v.grammar?((v.grammar.english?'ok':'NO-eng')):'NO-grammar';
  console.log(String(i+1).padStart(2)+' | '+v.arabic+' | '+v.meaning+' | g:'+g+' | by:'+String(v.verified&&v.verified.by)+' | hint:'+(v.hint?'yes':'NO'));
});
console.log('');
console.log('--- quiz (index | category | rhetoricArea | verified.by) ---');
m.quiz.forEach((q,i)=>{
  console.log(String(i+1).padStart(2)+' | '+q.category+' | '+(q.rhetoricArea||'(none)')+' | '+String(q.verified&&q.verified.by));
});
console.log('');
console.log('--- practice (index | q | hasExpl) ---');
m.practice.forEach((p,i)=>{
  console.log(String(i+1).padStart(2)+' | '+p.q+' | expl:'+(p.explanation?'yes':'NO'));
});

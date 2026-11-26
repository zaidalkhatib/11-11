const assert = require('node:assert/strict');
const fs = require('node:fs');
const {mapPreviewLabels, createClient} = require('../target/contracts/client.js');
const path = require('node:path');
const original = JSON.parse(fs.readFileSync(path.join(__dirname,'../src/main/resources/questionnaire-v1.json'),'utf8'));
const additions = JSON.parse(fs.readFileSync(path.join(__dirname,'../src/main/resources/questionnaire-v1.1-additions.json'),'utf8'));
const catalog = {version: original.version, revision: additions.revision, questions: [...original.questions,...additions.questions]};
const ui = require('../target/ui-fixture/onboarding.js');
let cases = 0;
function check(job) { job(); cases++; }
check(() => assert.deepEqual(mapPreviewLabels(catalog,{music:['Pop']}).answers.music.choices,['o01']));
check(() => assert.equal(mapPreviewLabels(catalog,{ethnicity:['Prefer not to say']}).answers.ethnicity.status,'DECLINED'));
check(() => assert.equal(mapPreviewLabels(catalog,{religion:['Christian']}).issues[0].code,'CONSENT_REQUIRED'));
check(() => assert.equal(mapPreviewLabels(catalog,{music:['Pop','I prefer quiet']}).issues[0].code,'EXCLUSIVE_OPTION'));
check(() => assert.equal(mapPreviewLabels(catalog,{music:['Pop','Pop']}).issues[0].code,'INVALID_SELECTION'));
check(() => assert.deepEqual(mapPreviewLabels(catalog,{music:[]}).answers,{}));
check(() => assert.equal(mapPreviewLabels(catalog,{selfRating:['10']}).issues[0].code,'COLLECTION_DISABLED'));
check(() => assert.equal(mapPreviewLabels(catalog,{phone:['synthetic']}).issues[0].code,'UNKNOWN_QUESTION'));
check(() => assert.throws(()=>createClient('http://localhost',async()=>'')));
check(() => { let calls=0; createClient('https://synthetic.example',async()=>{calls++;return 'token';}); assert.equal(calls,0); });
check(() => assert.equal(ui.QUESTION_COUNT,88));
check(() => assert.equal(ui.personalityQuestions.length,82));
check(() => assert.equal(catalog.questions.length,85));
check(() => assert.deepEqual(catalog.questions.slice(0,81),original.questions));
check(() => assert.deepEqual(mapPreviewLabels(original,{music:['Pop']}).answers.music.choices,['o01']));
const currentQuestions = [...ui.personalityQuestions,
  {key:'energy',options:['1','2','3','4','5']},
  {key:'conversations',options:ui.conversations,max:3},
  {key:'chemistry',options:ui.chemistryOptions}];
check(() => assert.deepEqual(new Set(currentQuestions.map(q=>q.key)),new Set(catalog.questions.map(q=>q.id))));
for (const question of currentQuestions) {
  const q = catalog.questions.find(q=>q.id===question.key);
  check(() => assert.deepEqual(q.options.map(o=>o.label),Array.from(question.options)));
  check(() => assert.equal(q.maximum,question.max ?? 1));
  for(const option of q.options) {
    check(() => {
      const result = mapPreviewLabels(catalog,{[q.id]:[option.label]},new Set([q.id]));
      if(option.declined) assert.equal(result.answers[q.id].status,'DECLINED');
      else if(q.scoring==='EXCLUDED') assert.equal(result.issues[0].code,'COLLECTION_DISABLED');
      else assert.deepEqual(result.answers[q.id].choices,[option.id]);
    });
  }
}
for(const q of additions.questions) {
  check(() => assert.equal(q.optional,true));
  check(() => assert.equal(q.scoring,'INACTIVE'));
  check(() => assert.deepEqual(mapPreviewLabels(catalog,{[q.id]:[]}).answers,{}));
  check(() => assert.equal(mapPreviewLabels(catalog,{[q.id]:['invalid']}).issues[0].code,'INVALID_SELECTION'));
  check(() => assert.equal(mapPreviewLabels(catalog,{[q.id]:[q.options[0].label,q.options[0].label]}).issues[0].code,'INVALID_SELECTION'));
}
async function revisionContractChecks() {
  let requests=[];
  const client=createClient('https://synthetic.invalid',async()=>'synthetic',async(input,init)=>{
    requests.push({input,init});return new Response(JSON.stringify({revision:'8'}),{status:200});
  });
  for(const missing of [undefined,'',0,'-1','01','*'])
    check(()=>assert.throws(()=>client.saveAnswer('music',{version:1,status:'DECLINED',choices:[],sensitiveConsent:false},missing),/ANSWER_REVISION_REQUIRED/));
  check(()=>assert.equal(requests.length,0));
  const ack=await client.saveAnswer('music',{version:1,status:'DECLINED',choices:[],sensitiveConsent:false},'7');
  check(()=>assert.equal(requests[0].init.headers['If-Match'],'"answers-7"'));
  check(()=>assert.deepEqual(ack,{revision:'8'}));
  await client.deleteAnswer('music','8');
  check(()=>assert.equal(requests[1].init.headers['If-Match'],'"answers-8"'));
  check(()=>assert.equal(requests[1].init.method,'DELETE'));
  console.log(`${cases} contract checks passed; all 88 UI steps reconciled (85 answers + 3 identity steps)`);
}
revisionContractChecks().catch(error=>{console.error(error);process.exitCode=1;});

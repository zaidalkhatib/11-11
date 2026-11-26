// Synthetic-only fixture. No app storage, user input or external destinations are read.
const assert = require('node:assert/strict');
const {createClient,ApiError,TransportError}=require('../../../target/contracts/client.js');
const {prepareAnswers,prepareProfile,saveProfile,savePreparedAnswers,selectScheduledEvent}=require('../../../target/contracts/preview-adapter.js');
const {emptyAnswers}=require('../../../target/ui-fixture/onboarding.js');
const port=Number(process.env.SYNTHETIC_HTTP_PORT);
const token=process.env.SYNTHETIC_HTTP_TOKEN;
if(!Number.isInteger(port)||port<1||port>65535||!token) throw new Error('Missing synthetic test context');
const origin='https://synthetic.invalid';
let calls=0, checks=0;
const check=(actual,expected)=>{assert.deepEqual(actual,expected);checks++;};
async function rejects(operation,predicate){await assert.rejects(operation,predicate);checks++;}
// Transport injection is test-source only. Production createClient still requires HTTPS.
async function loopbackTransport(input,init){
  const request=new URL(String(input));
  assert.equal(request.origin,origin);
  assert.ok(request.pathname.startsWith('/api/v1/'));
  calls++;
  const response=await fetch(`http://127.0.0.1:${port}${request.pathname}`,init);
  if(request.pathname.startsWith('/api/v1/me/')) assert.equal(response.headers.get('cache-control'),'no-store');
  return response;
}
async function main(){
  const client=createClient(origin,async()=>token,loopbackTransport);
  check(calls,0);
  const catalog=await client.questionnaire();check(catalog.questions.length,85);
  const preview={...emptyAnswers(),name:'Synthetic HTTP Person',phone:'DO-NOT-TRANSMIT',photoUri:'DO-NOT-TRANSMIT',note:'DO-NOT-TRANSMIT',experiences:['Dinner'],energy:3,conversations:['Big ideas','Food'],chemistry:'Easy laughter',traits:{
    goodNewsSupport:['Share my excitement'],feelingUnderstood:['Give me time to find the words'],
    conflictRepair:['Some space, then a check-in'],goalSupport:['Encourage me and let me lead'],
    religion:['Christian'],ethnicity:['Prefer not to say'],movies:[],
  }};
  const profileRequest=prepareProfile(preview,'1995-01-01',null);
  check(Object.keys(profileRequest).sort(),['dateOfBirth','displayName','expectedVersion']);
  const created=await saveProfile(client,profileRequest);check(created.state,'acknowledged');check(created.profile.identityVerified,false);
  check((await client.profile()).displayName,'Synthetic HTTP Person');
  check((await saveProfile(client,{...profileRequest,expectedVersion:0,displayName:'Synthetic updated'})).state,'acknowledged');
  check((await saveProfile(client,{...profileRequest,expectedVersion:0,displayName:'Stale overwrite'})).state,'conflict');
  check((await client.profile()).displayName,'Synthetic updated');
  const editingSnapshot=await client.answers();check(editingSnapshot.revision,"0");
  const missingConsent=prepareAnswers(catalog,preview);
  check(missingConsent.issues,[{questionId:'religion',code:'CONSENT_REQUIRED'}]);
  const beforeBlocked=calls;check((await savePreparedAnswers(client,missingConsent,editingSnapshot)).state,'blocked');check(calls,beforeBlocked);
  const plan=prepareAnswers(catalog,preview,new Set(['religion']));
  check(plan.issues,[]);check(plan.answers.movies,undefined);check(plan.answers.ethnicity.status,'DECLINED');
  check(JSON.stringify(plan).includes('DO-NOT-TRANSMIT'),false);
  const saved=await savePreparedAnswers(client,plan,editingSnapshot);check(saved.state,'acknowledged');check(saved.acknowledged.length,9);
  const answers=(await client.answers()).answers;check(answers.religion.sensitiveConsent,true);check(answers.ethnicity.choices,[]);check(answers.movies,undefined);
  for(const key of ['goodNewsSupport','feelingUnderstood','conflictRepair','goalSupport']) check(answers[key].status,'ANSWERED');
  await client.saveAnswer('goalSupport',{version:1,status:'DECLINED',choices:[],sensitiveConsent:false},saved.lastAcknowledgedRevision);
  check((await client.answers()).answers.goalSupport.status,'DECLINED');
  await client.deleteAnswer('goalSupport',(await client.answers()).revision);check((await client.answers()).answers.goalSupport,undefined);
  await rejects(()=>client.saveAnswer('religion',{version:1,status:'ANSWERED',choices:['o01'],sensitiveConsent:false},'11'),e=>e instanceof ApiError&&e.status===400);
  await rejects(()=>client.saveAnswer('goodNewsSupport',{version:1,status:'ANSWERED',choices:['invalid'],sensitiveConsent:false},'11'),e=>e instanceof ApiError&&e.status===400);
  const fresh=await client.answers();
  const changed=await client.saveAnswer('goalSupport',{version:1,status:'ANSWERED',choices:['o01'],sensitiveConsent:false},fresh.revision);
  await rejects(()=>client.deleteAnswer('goalSupport',fresh.revision),e=>e instanceof ApiError&&e.status===412&&e.currentRevision===changed.revision);
  await rejects(()=>client.saveAnswer('goalSupport',{version:1,status:'DECLINED',choices:[],sensitiveConsent:false},fresh.revision),e=>e instanceof ApiError&&e.status===412);
  const staleBatch=await savePreparedAnswers(client,plan,fresh);check(staleBatch.state,'incomplete');check(staleBatch.error.state,'conflict');check(staleBatch.lastAcknowledgedRevision,fresh.revision);
  const noPrecondition=await loopbackTransport(origin+'/api/v1/me/answers/goalSupport',{method:'DELETE',headers:{Authorization:`Bearer ${token}`}});check(noPrecondition.status,428);
  const beforeAnswerLoss=await client.answers();
  const lostAnswer=createClient(origin,async()=>token,async(input,init)=>{const response=await loopbackTransport(input,init);if(init.method==='PUT')throw new Error('Synthetic committed answer response lost');return response;});
  const lostBatch=await savePreparedAnswers(lostAnswer,plan,beforeAnswerLoss);
  check(lostBatch.state,'incomplete');check(lostBatch.acknowledged.length,0);check(lostBatch.lastAcknowledgedRevision,beforeAnswerLoss.revision);check(lostBatch.requiresReload,true);
  const afterAnswerLoss=await client.answers();check(BigInt(afterAnswerLoss.revision),BigInt(beforeAnswerLoss.revision)+1n);
  await rejects(()=>client.deleteAnswer('chemistry',beforeAnswerLoss.revision),e=>e instanceof ApiError&&e.status===412);
  const events=await client.events();check(events.length,1);
  assert.throws(()=>selectScheduledEvent(events,'Dinner'),/EXPLICIT_EVENT_ID_REQUIRED/);checks++;
  assert.throws(()=>selectScheduledEvent(events,'22222222-2222-4222-8222-222222222222'),/EVENT_NOT_IN_CURRENT_CATALOG/);checks++;
  const event=selectScheduledEvent(events,events[0].id);check(event.neighborhood,'Synthetic neighborhood');
  // Simulate a response lost AFTER the server commits interest. No false acknowledgement, no automatic retry.
  let lost=true;
  const unreliable=createClient(origin,async()=>token,async(input,init)=>{
    const response=await loopbackTransport(input,init);
    if(lost&&init.method==='PUT'&&String(input).includes('/interests/')){lost=false;throw new Error('Synthetic lost response');}
    return response;
  });
  const beforeLost=calls;
  await rejects(()=>unreliable.join(event.id),e=>e instanceof TransportError&&e.outcomeUncertain);
  check(calls,beforeLost+1);check(await client.interests(),[event.id]);
  check(await client.join(event.id),{state:'INTEREST_RECORDED',bookingConfirmed:false});
  check(await client.join(event.id),{state:'INTEREST_RECORDED',bookingConfirmed:false});
  check(await client.interests(),[event.id]);
  await client.leave(event.id);await client.leave(event.id);check(await client.interests(),[]);
  const unauthorized=createClient(origin,async()=>'invalid-synthetic-token',loopbackTransport);
  await rejects(()=>unauthorized.profile(),e=>e instanceof ApiError&&e.status===401);
  check((await saveProfile(unauthorized,profileRequest)).state,'unauthorized');
  let offlineCalls=0;
  const offline=createClient(origin,async()=>token,async()=>{offlineCalls++;throw new Error('Synthetic offline');});
  check((await saveProfile(offline,profileRequest)).state,'unconfirmed');check(offlineCalls,1);
  let interrupted=0;
  const flaky=createClient(origin,async()=>token,async(input,init)=>{interrupted++;if(interrupted===2)throw new Error('Synthetic interruption');return loopbackTransport(input,init);});
  const resumeSnapshot=await client.answers();
  const batch=await savePreparedAnswers(flaky,plan,resumeSnapshot);check(batch.state,'incomplete');check(batch.acknowledged.length,1);check(batch.remaining.length,8);check(batch.error.state,'unconfirmed');
  const afterBatch=(await client.answers()).answers;check(afterBatch[saved.acknowledged[0]],plan.answers[saved.acknowledged[0]]);
  // Timeout is synthetic transport cancellation, not a slow real server.
  const timed=createClient(origin,async()=>token,(_input,init)=>new Promise((_resolve,reject)=>init.signal.addEventListener('abort',()=>reject(new Error('timeout')))),{timeoutMs:5});
  await rejects(()=>timed.profile(),e=>e instanceof TransportError&&!e.outcomeUncertain);
  // Retry is explicit and limited to a fresh read after a 503, never an implicit mutation replay.
  let unavailable=true;
  const recovering=createClient(origin,async()=>token,(input,init)=>{
    if(unavailable){unavailable=false;return Promise.resolve(new Response('{"code":"UNAVAILABLE"}',{status:503}));}
    return loopbackTransport(input,init);
  });
  await rejects(()=>recovering.profile(),e=>e instanceof ApiError&&e.status===503);
  check((await recovering.profile()).identityVerified,false);
  console.log(`${checks} synthetic HTTP/adapter checks passed; ${calls} actual loopback requests; no bookings or verified identity`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});

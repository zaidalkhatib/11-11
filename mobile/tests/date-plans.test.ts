import test from "node:test";
import assert from "node:assert/strict";
import { plansReducer, dateTypes } from "../src/date-plans.ts";
test("each date type creates exactly one card", () => {
  let plans=plansReducer([], {type:"add",dateType:"Dinner"});
  plans=plansReducer(plans,{type:"add",dateType:"Dinner"});
  assert.equal(plans.length,1);
  assert.equal(plans[0].waiting,false);
  plans=plansReducer(plans,{type:"add",dateType:"Coffee"});
  assert.equal(plans.length,2);
});
test("waitlist and match previews remain independent per card", () => {
  let plans=plansReducer(plansReducer([],{type:"add",dateType:"Dinner"}),{type:"add",dateType:"Coffee"});
  plans=plansReducer(plans,{type:"patch",dateType:"Dinner",patch:{waiting:true,notify:false,demoMatched:true}});
  assert.equal(plans[0].waiting,true); assert.equal(plans[0].notify,false);
  assert.equal(plans[1].demoMatched,false);
  plans=plansReducer(plans,{type:"patch",dateType:"Dinner",patch:{day:"Weekends"}});
  assert.equal(plans[0].waiting,false); assert.equal(plans[0].demoMatched,false);
});
test("removal and restart clear only intended plans", () => {
  const plans=plansReducer(plansReducer([],{type:"add",dateType:"Dinner"}),{type:"add",dateType:"Coffee"});
  assert.deepEqual(plansReducer(plans,{type:"remove",dateType:"Dinner"}).map(p=>p.type),["Coffee"]);
  assert.deepEqual(plansReducer(plans,{type:"reset"}),[]);
});

test("date selection presents exactly three distinct choices",()=>{assert.deepEqual(dateTypes,["Dinner","A little adventure","Something creative"]);});

test("new selections do not assign a date or time",()=>{
 const plan=plansReducer([],{type:"add",dateType:"Dinner"})[0];
 assert.equal(plan.day,undefined);assert.equal(plan.time,undefined);assert.equal(plan.area,undefined);
});

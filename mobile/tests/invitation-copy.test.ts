import test from "node:test";
import assert from "node:assert/strict";
import {invitationFrame,invitationMessages} from "../src/invitation-copy.ts";
test("invitation copy types, holds, then advances",()=>{
 assert.equal(invitationFrame(0).text,"");
 assert.equal(invitationFrame(55).text,invitationMessages[0].slice(0,1));
 const length=invitationMessages[0].length*55;
 assert.equal(invitationFrame(length+1000).text,invitationMessages[0]);
 assert.equal(invitationFrame(length+2900).text,"");
 assert.equal(invitationFrame(length+3300).index,1);
});
test("invitation messages loop deterministically",()=>{
 const total=invitationMessages.reduce((sum,m)=>sum+m.length*55+3300,0);
 assert.deepEqual(invitationFrame(total+110),invitationFrame(110));
});

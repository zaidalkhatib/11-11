import {type Answers,personalityQuestions,onboardingSections,isStepValid,questionSection,QUESTION_COUNT} from "./onboarding.ts";
export function hasProfileAnswer(index:number,answers:Answers):boolean{
 if(index===2)return false;
 if(index===1)return !!answers.phone?.trim()&&isStepValid(index,answers);
 if(index>=6)return !!answers.traits?.[personalityQuestions[index-6].key]?.length&&isStepValid(index,answers);
 return isStepValid(index,answers);
}
export function profileProgress(answers:Answers){
 return onboardingSections.map(section=>{
   const indices=Array.from({length:QUESTION_COUNT},(_,i)=>i).filter(i=>i!==2&&questionSection(i)===section);
   const answered=indices.filter(i=>hasProfileAnswer(i,answers)).length;
   return {section,answered,total:indices.length,percent:Math.round(answered/indices.length*100)};
 });
}

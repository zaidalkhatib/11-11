import {type Answers,personalityQuestions,onboardingSections,isStepValid,questionSection,QUESTION_COUNT,PHOTO_STEP,TRAIT_OFFSET} from "./onboarding.ts";
export function hasProfileAnswer(index:number,answers:Answers):boolean{
 if(index===3)return false; // code preview
 if(index===PHOTO_STEP)return !!answers.photoUri.trim();
 if(index===0)return !!answers.phone?.trim()&&isStepValid(index,answers);
 if(index>=TRAIT_OFFSET)return !!answers.traits?.[personalityQuestions[index-TRAIT_OFFSET].key]?.length&&isStepValid(index,answers);
 return isStepValid(index,answers);
}
export function profileProgress(answers:Answers){
 return onboardingSections.map(section=>{
   const indices=Array.from({length:QUESTION_COUNT},(_,i)=>i).filter(i=>i!==3&&questionSection(i)===section);
   const answered=indices.filter(i=>hasProfileAnswer(i,answers)).length;
   return {section,answered,total:indices.length,percent:Math.round(answered/indices.length*100)};
 });
}

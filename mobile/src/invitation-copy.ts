export const invitationMessages = [
  "What could start with a hello?",
  "A table for two. A little possibility.",
  "Make room for a first spark.",
  "A blind date. An open mind.",
] as const;
export function invitationFrame(elapsed: number) {
  const durations = invitationMessages.map(message=>message.length*55+3300);
  const total=durations.reduce((sum,n)=>sum+n,0);
  let position=Math.max(0,elapsed)%total;
  for(let i=0;i<invitationMessages.length;i++){
    if(position<durations[i]){
      const message=invitationMessages[i];
      const typingEnds=message.length*55;
      return {message, text: position>=typingEnds+2800 ? "" : message.slice(0,Math.floor(position/55)), index:i};
    }
    position-=durations[i];
  }
  return {message:invitationMessages[0],text:"",index:0};
}

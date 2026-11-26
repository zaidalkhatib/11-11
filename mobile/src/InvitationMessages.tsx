import React,{useEffect,useState} from "react";
import {AppState,Text,View} from "react-native";
import {color,serif} from "./theme";
import {invitationFrame,invitationMessages} from "./invitation-copy";
export function InvitationMessages({reduce}:{reduce:boolean}){
 const [active,setActive]=useState(AppState.currentState==="active");
 const [elapsed,setElapsed]=useState(0);
 useEffect(()=>{const listener=AppState.addEventListener("change",s=>setActive(s==="active"));return()=>listener.remove();},[]);
 useEffect(()=>{
   if(reduce||!active)return;
   const start=Date.now();
   const timer=setInterval(()=>setElapsed(Date.now()-start),55);
   return()=>clearInterval(timer);
 },[reduce,active]);
 const frame=invitationFrame(elapsed);
 return <View style={{minHeight:100,marginTop:24,paddingHorizontal:38,justifyContent:"flex-start",alignItems:"center"}}>
   <Text accessible accessibilityLabel={reduce?invitationMessages[0]:frame.message} accessibilityLiveRegion="none" style={{fontFamily:serif,fontSize: 18,lineHeight: 26,color:color.ink,textAlign:"center"}}>{reduce?invitationMessages[0]:frame.text}</Text>
 </View>;
}

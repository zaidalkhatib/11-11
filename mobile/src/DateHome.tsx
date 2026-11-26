import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, PanResponder } from "react-native";
import { color, serif } from "./theme";
import { dateTypes, DatePlan, DateType, PlanAction } from "./date-plans";

export function NavIcon({ name, active = false }: { name: "You" | "Events" | "Invites"; active?: boolean }) {
  const ink = active ? color.ink : color.muted;
  return <View accessible={false} style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}>
    {name === "Events" ? <><View style={{ position:"absolute", width: 25, height: 1.5, backgroundColor: ink }}/><View style={{ width: 1.5, height:25, backgroundColor: ink }}/></> : name === "You" ? <><View style={{width:10,height:10,borderWidth:1.5,borderColor:ink,borderRadius:8,marginBottom:3}}/><View style={{width:24,height:12,borderWidth:1.5,borderBottomWidth:0,borderColor:ink,borderTopLeftRadius:14,borderTopRightRadius:14}}/></> : <View style={{width:27,height:19,borderWidth:1.5,borderColor:ink,borderRadius:4,justifyContent:"center",alignItems:"center"}}><View style={{height:12,borderLeftWidth:1,borderColor:ink,borderStyle:"dashed"}}/></View>}
  </View>;
}
export function InvitationArt() {
  return <View accessible accessibilityLabel="No invitations yet. An 11:11 spark waiting to connect." style={d.inviteArt}>
    <View style={d.sparkOrbit}/>
    <View style={d.sparkOrbitInner}/>
    <View style={d.elevenMark}>{[0,1,2,3].map(i=><View key={i} style={[d.elevenBeam,{marginLeft:i===2?24:7,height:i%2===0?54:68}]}/>)}</View>
    <View style={[d.sparkDot,{top:54}]}/><View style={[d.sparkDot,{top:72}]}/>
    <View style={d.sparkDiamond}/>
  </View>;
}
const subtitles: Record<DateType,string> = { Dinner:"A table for two.", Coffee:"A slow first hello.", "A little adventure":"Take the scenic route.", "Something creative":"Make something together." };
function SlideToJoin({done,onComplete}:{done:boolean;onComplete:()=>void}) {
  const [width,setWidth]=useState(280);
  const [x]=useState(()=>new Animated.Value(0));
  const limit=Math.max(0,width-64);
  const responder=PanResponder.create({
    onStartShouldSetPanResponder:()=>!done,
    onMoveShouldSetPanResponder:(_,g)=>!done&&Math.abs(g.dx)>Math.abs(g.dy),
    onPanResponderMove:(_,g)=>x.setValue(Math.max(0,Math.min(limit,g.dx))),
    onPanResponderRelease:(_,g)=>{if(g.dx>=limit*0.8&&limit>0)onComplete();Animated.spring(x,{toValue:0,useNativeDriver:true}).start();},
    onPanResponderTerminate:()=>Animated.spring(x,{toValue:0,useNativeDriver:true}).start()
  });
  return <View accessible accessibilityRole="button" accessibilityLabel={done?"Joined preview waitlist":"Slide to join preview waitlist"} accessibilityState={{disabled:done}} accessibilityActions={[{name:"activate",label:"Join preview waitlist"}]} onAccessibilityAction={e=>{if(e.nativeEvent.actionName==="activate"&&!done)onComplete();}} onLayout={e=>setWidth(e.nativeEvent.layout.width)} style={{height:64,borderWidth:1,borderColor:color.line,borderRadius:20,justifyContent:"center",overflow:"hidden"}}>
    <Text style={[d.serif,{fontSize: 15,textAlign:"center",paddingLeft:40}]}>{done?"On the preview waitlist":"Slide to join · preview"}</Text>
    <Animated.View {...responder.panHandlers} style={{position:"absolute",left:4,top:4,width:54,height:54,borderWidth:1,borderColor:color.line,backgroundColor:color.surfaceRaised,borderRadius:16,alignItems:"center",justifyContent:"center",transform:[{translateX:x}]}}><Text style={d.chevron}>{done?"✓":"›"}</Text></Animated.View>
  </View>;
}
export function DateHome({plans, dispatch}: {plans:DatePlan[];dispatch:React.Dispatch<PlanAction>;reduce:boolean}) {
  const [editing,setEditing]=useState<DateType|null>(null);
  const plan=plans.find(p=>p.type===editing);
  return <ScrollView style={{flex:1}} contentContainerStyle={d.root} showsVerticalScrollIndicator={false}>
    <View style={d.selectorWrap}>
      {!plan ? <View style={d.visibleOptions}>{dateTypes.map(type=><Pressable key={type} accessibilityRole="button" accessibilityLabel={`${type}, ${plans.some(p=>p.type===type&&p.waiting)?"on preview waitlist":"select date"}`} onPress={()=>{dispatch({type:"add",dateType:type});setEditing(type);}} style={d.optionRow}>
        <View style={{flex:1}}><Text style={d.optionTitle}>{type}</Text><Text style={d.optionCaption}>{subtitles[type]}</Text></View>
        <Text style={d.chevron}>{plans.some(p=>p.type===type&&p.waiting)?"✓":"›"}</Text>
      </Pressable>)}</View> : <View style={d.visibleOptions}>
        <View style={d.optionRow}><View style={{flex:1}}><Text style={d.optionTitle}>{plan.type}</Text><Text style={d.optionCaption}>{subtitles[plan.type]}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Back to date choices" onPress={()=>setEditing(null)} style={d.close}><Text style={d.chevron}>×</Text></Pressable></View>
        <SlideToJoin key={plan.type+String(plan.waiting)} done={plan.waiting} onComplete={()=>dispatch({type:"patch",dateType:plan.type,patch:{waiting:true,demoMatched:false}})}/>
      </View>}
    </View>
  </ScrollView>;
}
export const dateStyles = StyleSheet.create({
 inviteBody:{flex:1,alignItems:"center",justifyContent:"center"},
 inviteCard:{margin:26,padding:26,borderWidth:1,borderColor:color.line,borderRadius:24},
 inviteText:{color:color.ink,fontFamily:serif,fontSize: 18},
});
const d=StyleSheet.create({
 root:{flexGrow:1,justifyContent:"center",paddingVertical:20,overflow:"hidden"},
 orbit:{position:"absolute",width:600,height:600,borderRadius:300,borderWidth:1,borderColor:color.line,opacity:0.3,left:-260,top:20},
 orbitInner:{position:"absolute",width:350,height:350,borderRadius:180,borderWidth:1,borderColor:color.line,opacity:0.3,right:-170,bottom:10},
 selectorWrap:{marginHorizontal:26,zIndex:2},
 dropdown:{borderWidth:1,borderColor:color.line,borderRadius:24,paddingHorizontal:24,paddingVertical:20,flexDirection:"row",justifyContent:"space-between",alignItems:"center",backgroundColor:color.surface},
 serif:{fontFamily:serif,fontSize: 18,color:color.ink},
 chevron:{fontSize: 18,color:color.ink},
 menu:{padding:8,borderWidth:1,borderColor:color.line,borderRadius:24,backgroundColor:color.surface,marginTop:8},
 menuItem:{minHeight:52,flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:16},
 menuText:{color:color.ink,fontSize: 15,lineHeight:23},
 empty:{height:230,alignItems:"center",justifyContent:"center"},
 emptyGlyph:{color:color.accent,fontSize:55},emptyText:{fontFamily:serif,color:color.muted,fontSize: 15,marginTop:18},
 cards:{paddingHorizontal:26,paddingVertical:20,gap:16,alignItems:"center"},card:{padding:24,borderWidth:1,borderColor:color.line,borderRadius:28,backgroundColor:color.surface,minHeight:340},
 kicker:{color:color.muted,fontSize:10,letterSpacing:2},
 cardArt:{fontSize:54,color:color.accent,textAlign:"center",marginVertical:22},
 cardTitle:{fontFamily:serif,color:color.ink,fontSize: 22,lineHeight: 29,marginBottom:14},
 divider:{height:1,backgroundColor:color.line,marginVertical:18},
 details:{fontSize:14,color:color.muted,lineHeight:23},status:{fontSize:12,color:color.accent,marginTop:18},
 preview:{color:color.muted,fontSize:10,textAlign:"center",padding:14},
 notice:{marginHorizontal:26,padding:18,borderRadius:18,backgroundColor:color.surface,borderWidth:1,borderColor:color.accent},
 sheet:{flex:1,backgroundColor:color.background},sheetTop:{paddingHorizontal:26,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},close:{padding:12,minHeight:44,minWidth:44},
 sheetBody:{padding:26,gap:20},fieldLabel:{fontSize:12,color:color.muted,letterSpacing:1,marginBottom:12},
 choices:{flexDirection:"row",flexWrap:"wrap",gap:8},choice:{borderWidth:1,borderColor:color.line,paddingHorizontal:14,paddingVertical:12,borderRadius:20},choiceSelected:{borderColor:color.accent,backgroundColor:color.surface},
 toggle:{flexDirection:"row",alignItems:"center",gap:10},small:{color:color.muted,fontSize:12,lineHeight:19,marginTop:6},
 primary:{backgroundColor:color.ink,padding:18,borderRadius:30,alignItems:"center"},primaryText:{color:color.background,fontSize:15},secondary:{paddingVertical:14,alignItems:"center"},
 inviteArt:{width:180,height:160,alignItems:"center",justifyContent:"center"},
 sparkOrbit:{position:"absolute",width:166,height:106,borderRadius:83,borderWidth:1,borderColor:color.line,transform:[{rotate:"-28deg"}],opacity:0.7},
 sparkOrbitInner:{position:"absolute",width:138,height:86,borderRadius:70,borderWidth:1,borderColor:color.line,transform:[{rotate:"28deg"}],opacity:0.35},
 elevenMark:{flexDirection:"row",alignItems:"center",marginLeft:-7},
 elevenBeam:{width:2,backgroundColor:color.accent,borderRadius:2},
 sparkDot:{position:"absolute",left:87,width:4,height:4,borderRadius:2,backgroundColor:color.ink},
 sparkDiamond:{position:"absolute",right:25,top:21,width:9,height:9,borderWidth:1,borderColor:color.accent,transform:[{rotate:"45deg"}]},
 visibleOptions:{padding:8,borderWidth:1,borderColor:color.line,borderRadius:26,backgroundColor:color.surface},
 optionRow:{minHeight:78,paddingVertical:14,paddingHorizontal:18,flexDirection:"row",alignItems:"center",gap:12},
 optionTitle:{fontFamily:serif,fontSize: 16,color:color.ink},
 optionCaption:{fontSize:12,color:color.muted,marginTop:5},
});

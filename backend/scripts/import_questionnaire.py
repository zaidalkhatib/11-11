"""One-time UI snapshot importer. Review generated IDs; never regenerate a released version.
No answer data is read. Existing catalog is never overwritten.
"""
import json, re, pathlib, math
root = pathlib.Path(__file__).resolve().parents[2]
src = (root / 'mobile/src/onboarding.ts').read_text()
preferences = {'sharedFaith':'religion','sharedBackground':'ethnicity','values':'partnerTraits','interestedIn':'gender','childrenAlignment':'familyPlans','smokingFit':'smoking','drinkingFit':'drinking','distanceFit':'location','partnerEnergy':'energy','sharedActivity':'workout','politicalFit':'politicalOutlook'}
sensitive = {'religion','faithImportance','sharedFaith','ethnicity','sharedBackground','orientation','politicalOutlook','politicalFit','reproductiveValues'}
excluded = {'selfRating','bodyBuild','childhoodResources','height','looksImportance'}
questions=[]
for line in src.splitlines():
    if not re.search(r'(?:"key"|key):',line): continue
    line = re.sub(r'(?<=[{,])\s*([A-Za-z]+):',r' "\1":',line.strip().rstrip(','))
    heights = [f'{i//12}′{i%12}″ / {math.floor(i*2.54+0.5)} cm' for i in range(48,97)] + ['Outside this range','Prefer not to say']
    line = line.replace('heightOptions',json.dumps(heights))
    q=json.loads(line); key=q['key']; opts=[]
    for idx,label in enumerate(q['options']):
        declined = label in ['Prefer not to say','I’d rather not rate myself']
        exclusive = declined or label in ['No pets for me','Open to discovering','I prefer quiet','A little of everything','Not a focus for me','Not really a movie person']
        opts.append(dict(id=f'o{idx+1:02}',label=label,declined=declined,exclusive=exclusive))
    questions.append(dict(id=key,version=1,title=q['title'],kind='PREFERENCE' if key in preferences else 'IMPORTANCE' if 'Importance' in key or key=='reproductiveValues' else 'SELF',target=preferences.get(key),sensitive=key in sensitive,scoring='EXCLUDED' if key in excluded else 'INACTIVE',maximum=q.get('max',1),options=opts))
for key,labels in [('energy',['1','2','3','4','5']),('conversations',['Big ideas','Music & culture','Travel stories','Everyday things','Food','What makes us, us']),('chemistry',['Easy laughter','A different perspective','Feeling understood','A little spontaneity'])]:
    questions.append(dict(id=key,version=1,title=key,kind='SELF',target=None,sensitive=False,scoring='INACTIVE',maximum=3 if key=='conversations' else 1,options=[dict(id=f'o{i+1:02}',label=label,declined=False,exclusive=False) for i,label in enumerate(labels)]))
out=root/'backend/src/main/resources/questionnaire-v1.json'
with out.open('x') as f: json.dump(dict(version='onboarding-v1',questions=questions),f,indent=2,ensure_ascii=False)
print(f'{len(questions)} answer definitions; 3 UI identity steps excluded')

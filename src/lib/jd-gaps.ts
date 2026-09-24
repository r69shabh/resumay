// Deterministic job-description keyword-gap analysis. No backend, no LLM:
// tokenize the JD, drop stopwords and anything already in the resume text,
// rank what's left by frequency. Single words only, not phrases.

export type GapTerm = { term: string; count: number };

export type GapResult = {
  missing: GapTerm[];
  coverage: number;
  jdTerms: number;
};

const STOP = new Set(
  (
    "a,an,the,and,or,but,if,then,else,for,to,of,in,on,at,by,with,from,as,is,are,was,were,be,been,being,have,has,had,do,does,did,will,would,can,could,should,may,might,must,shall,this,that,these,those,it,its,you,your,we,our,they,their,he,she,them,his,her,who,whom,which,what,when,where,how,why,not,no,yes,all,any,each,every,both,few,more,most,other,some,such,only,own,same,so,than,too,very,just,also,across,within,without,between,through,during,before,after,per,via,including,include,includes,based,using,use,used,strong,plus,join,looking,seeking,hiring,role,you'll,we're,years,year,day,today,work,working,team,teams,company,business,products,product,customers,client,clients,world,class,best,top,new,high,highly,great,good,strongly,proven,ability,able,opportunity,opportunities,environment,growth,fast,paced,passionate,driven,motivated,excellent,exceptional,outstanding,diverse,dynamic,impact,impactful,collaborate,collaboration,collaborative,communication,communicate,stakeholders,requirements,design,develop,development,build,building,maintain,maintaining,support,help,drive,deliver,delivering,ensure,identify,analyze,improve,improving,provide,create,creating,lead,leading,manage,managing,mentor,ownership,quality,scale,scalable,reliable,robust,efficient,clean,modern,cutting,edge,deep,dive,resume,cv,description,preferred,nice,bonus,experience,experienced,knowledge,know,senior,junior,mid,level,levels,system,systems,requirements,required,responsibility,responsibilities,qualification,qualifications,candidate,ideal,background,record,must,month,months,remote,hybrid,onsite,salary,compensation,benefits,vacation"
      .split(",")
  ).map((s) => s.trim()).filter(Boolean),
);

function tokens(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z0-9+#.\-]*/g) || [])
    .map((t) => t.replace(/^[.\-]+|[.\-]+$/g, ""))
    .filter((t) => t.length >= 2 && !STOP.has(t) && !/^\d+$/.test(t));
}

export function analyzeGaps(jd: string, resumeText: string): GapResult {
  const jdTokens = tokens(jd);
  const resumeSet = new Set(tokens(resumeText));
  const freq = new Map<string, number>();
  for (const t of jdTokens) {
    if (!resumeSet.has(t)) freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  const distinctive = new Set(jdTokens.filter((t) => !STOP.has(t)));
  const missing = [...freq.entries()]
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, 25);
  const matched = [...distinctive].filter((t) => resumeSet.has(t)).length;
  return {
    missing,
    coverage: distinctive.size ? matched / distinctive.size : 0,
    jdTerms: distinctive.size,
  };
}

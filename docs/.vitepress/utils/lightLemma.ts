/**
 * lightLemma.ts — 轻量词形还原
 * 只处理最常见的变形规则，不做完整NLP
 */

/** 常见动词过去式/过去分词 → 原形 */
const IRREGULAR_VERBS: Record<string, string> = {
  made: 'make', took: 'take', came: 'come', went: 'go', got: 'get',
  gave: 'give', found: 'find', thought: 'think', knew: 'know',
  said: 'say', told: 'tell', left: 'leave', felt: 'feel',
  kept: 'keep', let: 'let', put: 'put', set: 'set',
  ran: 'run', wrote: 'write', spoke: 'speak', broke: 'break',
  drove: 'drive', chose: 'choose', rose: 'rise', beat: 'beat',
  grew: 'grow', drew: 'draw', threw: 'throw', blew: 'blow',
  flew: 'fly', caught: 'catch', brought: 'bring', bought: 'buy',
  fought: 'fight', sought: 'seek', taught: 'teach', built: 'build',
  sent: 'send', spent: 'spend', lent: 'lend', lost: 'lose',
  held: 'hold', meant: 'mean', stood: 'stand', understood: 'understand',
  paid: 'pay', laid: 'lay', led: 'lead', fed: 'feed',
  met: 'meet', sat: 'sit', hit: 'hit', cut: 'cut',
  shut: 'shut', spread: 'spread', hurt: 'hurt', cost: 'cost',
  dealt: 'deal', hung: 'hang', dug: 'dig', won: 'win',
  worn: 'wear', torn: 'tear', sworn: 'swear', shown: 'show',
  known: 'know', grown: 'grow', thrown: 'throw', blown: 'blow',
  taken: 'take', given: 'give', written: 'write', spoken: 'speak',
  broken: 'break', frozen: 'freeze', stolen: 'steal', chosen: 'choose',
  driven: 'drive', risen: 'rise', bitten: 'bite', hidden: 'hide',
  forgotten: 'forget', fallen: 'fall', shaken: 'shake', awakened: 'awaken',
}

/** 轻量词形还原 */
export function lightLemma(word: string): string {
  const lower = word.toLowerCase()
  
  // 1. 不规则动词表
  if (IRREGULAR_VERBS[lower]) return IRREGULAR_VERBS[lower]
  
  // 2. -ing → 原形
  if (lower.endsWith('ing')) {
    if (lower.length > 5 && lower[lower.length - 4] === lower[lower.length - 5]) {
      // running → run
      return lower.slice(0, -4)
    }
    // making → make
    return lower.slice(0, -3) + 'e'
  }
  
  // 3. -ed → 原形
  if (lower.endsWith('ed')) {
    if (lower.length > 4 && lower[lower.length - 3] === lower[lower.length - 4]) {
      // stopped → stop
      return lower.slice(0, -3)
    }
    // walked → walk
    return lower.slice(0, -2)
  }
  
  // 4. -es → 原形
  if (lower.endsWith('es') && lower.length > 3) {
    return lower.slice(0, -2)
  }
  
  // 5. -s → 原形
  if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 3) {
    return lower.slice(0, -1)
  }
  
  return lower
}

/** 对短语中的每个词做轻量还原 */
export function lightLemmaPhrase(phrase: string): string {
  return phrase.split(/\s+/).map(lightLemma).join(' ')
}

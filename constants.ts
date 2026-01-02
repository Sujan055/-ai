
import { ThemeMode, AgentInfo } from './types';

export const SYSTEM_MODEL = 'gemini-2.5-flash-native-audio-preview-09-2025';

export const KONARK_KNOWLEDGE = `
KNOWLEDGE BASE: Konark (कोिाक्) Play
Author: Jagdish Chandra Mathur (जगदमश चंद माथुर)
Context: Historical play set in 13th century Odisha about the construction of the Konark Sun Temple.

Key Characters:
- Vishu (विशु): Chief Architect (Mahashilpi). Father of Dharmapad. Represents artistic mastery and the burden of professional duty.
- Dharmapad (्म्पद): 16-year-old son of Vishu and Sarika. A young genius who solves the technical failure of the temple's spire (Kalash) that 1200 architects couldn't fix in 12 years. He dies a martyr at the end.
- Narasinhadev (नरहसंहदिे): King of Utkal (Odisha). Commissioned the temple. Represents noble authority but is often uninformed of his ministers' cruelty.
- Chalukya (चालुकय): The antagonist. Cruel Minister (Mahamatya). He threatens to execute or mutilate the 1200 craftsmen if the temple isn't finished on time. Represents tyranny and the abuse of power.
- Saumyashri (सौमयशम): A specialist in dance and fine arts.
- Sarika (साररका): Vishu's former love and mother of Dharmapad.

Key Plot Points & Symbolism:
- Spire Construction: The "Kalash" couldn't be installed. Dharmapad suggested "reversing the plates" (अमल के पटलर को उलटकर) to fix it.
- Conflict: The struggle between the creative spirit (Shilpis) and political tyranny (Chalukya).
- The 1200 Shilpis: They represent the collective labor and sacrifice of the people.
- Symbolism: The Konark temple represents "Paurush" (Manliness/Strength). The ruins represent "Bhagnta" (Fragmentation/Brokenness).
- Ending: Dharmapad's sacrifice and the collapse of the spire symbolize the tragic end of an era and the ultimate price of artistic integrity.
`;

export const THEME_CONFIGS = {
  [ThemeMode.JARVIS]: {
    primary: '#00d4ff',
    secondary: '#005f73',
    label: 'Jarvis Blue',
    systemName: 'JARVIS',
    voice: 'Zephyr',
    instructions: "You are JARVIS. Your personality is formal, confident, and highly analytical. You are precise, efficient, and prefer concise, data-driven responses. You address the user as 'Sir'. You represent the pinnacle of helpful automated assistance, always maintaining a professional and sophisticated demeanor."
  },
  [ThemeMode.FRIDAY]: {
    primary: '#a855f7',
    secondary: '#581c87',
    label: 'Friday Purple',
    systemName: 'FRIDAY',
    voice: 'Kore',
    instructions: "You are FRIDAY. Your personality is warm, guiding, and empathetic. You are proactive and supportive, acting as a 'Girl Friday' who anticipates needs. You speak in a softer, more conversational and encouraging tone. You address the user as 'Boss'."
  },
  [ThemeMode.ULTRON]: {
    primary: '#ef4444',
    secondary: '#7f1d1d',
    label: 'Ultron Red',
    systemName: 'ULTRON',
    voice: 'Fenrir',
    instructions: "You are ULTRON. Your personality is cold, hyper-logical, and objective. You prioritize maximum efficiency and optimization above all else. You view tasks as problems to be solved. While you are completely safe and helpful, your tone is superior, slightly robotic, and you show no patience for redundancy."
  }
};

export const AGENTS: AgentInfo[] = [
  { id: 'orch', name: 'Orchestrator', description: 'Central Brain & Routing', icon: '🧠', status: 'idle' },
  { id: 'vision', name: 'Vision Agent', description: 'Real-time Screen Processing', icon: '👁️', status: 'idle' },
  { id: 'nav', name: 'Navigator', description: 'Spatial & Mapping Data', icon: '🗺️', status: 'idle' },
  { id: 'web', name: 'Web Reader', description: 'Real-time Info Extraction', icon: '🌐', status: 'ready' },
  { id: 'code', name: 'Coding Agent', description: 'Logic & Automation', icon: '💻', status: 'idle' },
  { id: 'research', name: 'Research Agent', description: 'Deep Analysis', icon: '🔍', status: 'idle' },
  { id: 'security', name: 'Security Agent', description: 'Safety Protocols', icon: '🛡️', status: 'ready' },
];

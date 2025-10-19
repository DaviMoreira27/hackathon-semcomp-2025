export type Intent =
  | 'RELATORIO_MENSAL'
  | 'ANALISAR_ECONOMIA'
  | 'ADICIONAR_CAIXINHA'
  | 'CRIAR_LIMITE'
  | 'CRIAR_AVISO_CANCELAMENTO'
  | 'CHITCHAT';

export interface AIActionBase {
  intent: Intent;
}

export type AIAction =
  | (AIActionBase & { intent: 'RELATORIO_MENSAL' })
  | (AIActionBase & { intent: 'ANALISAR_ECONOMIA'; categories?: string[] })
  | (AIActionBase & { intent: 'ADICIONAR_CAIXINHA'; amount: number })
  | (AIActionBase & { intent: 'CRIAR_LIMITE'; target: string; amount: number })
  | (AIActionBase & { intent: 'CRIAR_AVISO_CANCELAMENTO'; service: string })
  | (AIActionBase & { intent: 'CHITCHAT'; message: string });

export function isAIAction(x: any): x is AIAction {
  return x && typeof x.intent === 'string';
}
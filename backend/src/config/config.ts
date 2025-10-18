import { NodeEnvironments } from './config.types';

export default () => ({
  // SERVER
  environment: getEnv(process.env.NODE_ENV),
  port: parseInt(process.env.PORT || '3000', 10),

  // WHATSAPP
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? 'APPLE',
  whatsappAccessToken: process.env.WHATSSAP_ACCESS_TOKEN ?? 'BANANA',

  // OPEN AI
  openaiModel: process.env.OPEN_AI_MODEL ?? 'gpt-4o-mini',
  openaiKey: process.env.OPENAI_API_KEY ?? ''
});

function getEnv(environment?: string) {
  return Object.values(NodeEnvironments).includes(environment as NodeEnvironments)
    ? (environment as NodeEnvironments)
    : NodeEnvironments.DEVELOPMENT;
}

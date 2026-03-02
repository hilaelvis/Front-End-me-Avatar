import { APP_CONFIG_DEFAULTS } from '@/app-config';
import AgentClient from '@/components/embed-popup/agent-client';

export default function Home() {
  return (
    <main className="min-h-screen">
      <AgentClient appConfig={APP_CONFIG_DEFAULTS} />
    </main>
  );
}

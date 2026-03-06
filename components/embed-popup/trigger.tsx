import { AnimatePresence, motion } from 'motion/react';
import { useVoiceAssistant } from '@livekit/components-react';
import { PhoneDisconnectIcon, XIcon } from '@phosphor-icons/react';
import { EmbedErrorDetails } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const AnimatedButton = motion.create(Button);

interface TriggerProps {
  error: EmbedErrorDetails | null;
  popupOpen: boolean;
  onToggle: () => void;
  baseUrl?: string;
}

export function Trigger({ error = null, popupOpen, onToggle, baseUrl }: TriggerProps) {
  // Use baseUrl for embedded widgets, relative path for direct access
  // Strip https:// if present in baseUrl
  const cleanBaseUrl = baseUrl?.replace(/^https?:\/\//, '');
  const logoSrc = cleanBaseUrl ? `https://${cleanBaseUrl}.vercel.app/lk-logo.svg` : '/lk-logo.svg';
  const { state: agentState } = useVoiceAssistant();

  const isAgentConnecting =
    popupOpen && (agentState === 'connecting' || agentState === 'initializing');

  const isAgentConnected =
    popupOpen &&
    agentState !== 'disconnected' &&
    agentState !== 'connecting' &&
    agentState !== 'initializing';

  return (
    <AnimatePresence>
      <AnimatedButton
        key="trigger-button"
        size="lg"
        variant="ghost"
        initial={{
          scale: 0,
        }}
        animate={{
          scale: 1,
        }}
        exit={{ scale: 0 }}
        transition={{
          type: 'spring',
          duration: 1,
          bounce: 0.2,
        }}
        onClick={onToggle}
        className={cn(
          'group relative m-0 block p-0 drop-shadow-md transition-[width,height] duration-300',
          'hover:!bg-transparent focus:!bg-transparent',
          popupOpen ? 'size-[67px]' : 'size-20',
          'fixed right-8 bottom-4 z-50'
        )}
      >
        {/* Speech bubble */}
        {!popupOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.5 }}
            className="absolute right-0 bottom-full z-0 mb-4"
          >
            <div className="relative rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm font-medium whitespace-nowrap text-gray-800 dark:text-white">
                Posso aiutarti?
              </p>
              {/* Speech bubble tail */}
              <div className="absolute right-3 -bottom-2 h-4 w-4 rotate-45 transform border-r border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"></div>
            </div>
          </motion.div>
        )}

        {/* icon */}
        <div
          className={cn(
            'relative z-20 grid place-items-center rounded-full overflow-hidden transition-all duration-300',
            'ring-0 ring-white group-hover:ring-[1.5px] group-focus:ring-[1.5px]',
            popupOpen ? 'size-[67px]' : 'size-20',
            (isAgentConnected || (error && popupOpen)) && 'bg-destructive'
          )}
        >
          {/* Logo - outside AnimatePresence for instant unmount in shadow DOM */}
          {!popupOpen && (
            <motion.div
              key="lk-logo"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${logoSrc}?v=18`}
                alt="Logo"
                className="h-full w-full object-cover object-top"
              />
            </motion.div>
          )}
          <AnimatePresence>
            {(isAgentConnecting || (error && popupOpen)) && (
              <motion.div
                key="dismiss"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: popupOpen ? -20 : 20 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <XIcon
                  size={20}
                  weight="bold"
                  className={cn('text-fg0 size-5', error && 'text-destructive-foreground')}
                />
              </motion.div>
            )}
            {!error && isAgentConnected && (
              <motion.div
                key="disconnect"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: popupOpen ? -20 : 20 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <PhoneDisconnectIcon
                  size={20}
                  weight="bold"
                  className="text-destructive-foreground size-5"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AnimatedButton>
    </AnimatePresence>
  );
}

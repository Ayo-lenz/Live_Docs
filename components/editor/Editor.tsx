'use client';

import Theme from './plugins/Theme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { HeadingNode } from '@lexical/rich-text';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import React, { useEffect, useState } from 'react';
import { FloatingComposer, FloatingThreads, liveblocksConfig, LiveblocksPlugin, useEditorStatus, useIsEditorReady } from '@liveblocks/react-lexical';
import Loader from '../Loader';
import { useSyncStatus} from '@liveblocks/react';
import FloatingToolbarPlugin from './plugins/FloatingToolbarPlugin';
import { useThreads } from '@liveblocks/react/suspense';
import Comments from '../Comments';
import { DeleteModal } from '../DeleteModal';

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}


/* to start adding live features to our application like live cursors, comments e.t.c
we will wrap the initial editor config object with the liveblocks config coming from
npm install @liveblocks/react-lexical
*/
export function Editor({ roomId, currentUserType }: {roomId: string, currentUserType: UserType}) {

  const syncStatus = useSyncStatus();
  const { threads } = useThreads();

  // Derive the connecting state (true until the first syncStatus update)
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    console.log("Sync Status Changed:", syncStatus);

    if (syncStatus === "synchronized") {
      setIsConnecting(false);
    }
  }, [syncStatus]);

  const initialConfig = liveblocksConfig({
    namespace: 'Editor',
    nodes: [HeadingNode],
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
    theme: Theme,
    //to figure out if the text is editable or not so we have the editable property to be true
    editable: currentUserType === 'editor',
  });

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container size-full">
        {/* to have the comments on the right side and editor on the left side */}
        <div className="toolbar-wrapper flex min-w-full justify-between">
          <ToolbarPlugin />
          {currentUserType === 'editor' && <DeleteModal roomId={roomId}/>}
        </div>

        <div className="editor-wrapper flex flex-col items-center justify-start">
          {isConnecting ? <Loader /> : (            
            <div className="editor-inner min-h-[1100px] relative mb-5 h-fit w-full max-w-[800px] shadow-md lg:mb-10">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="editor-input h-full" />
                }
                placeholder={<Placeholder />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              {currentUserType === 'editor' && <FloatingToolbarPlugin/>}
              <HistoryPlugin />
              <AutoFocusPlugin />
            </div>
          )}

          <LiveblocksPlugin>
            <FloatingComposer className='w-[350px]'/>
            <FloatingThreads threads={threads} />
            <Comments /> 
          </LiveblocksPlugin>
        </div>
      </div>
    </LexicalComposer>
  );
}

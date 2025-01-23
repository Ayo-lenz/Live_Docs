'use client';

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import Loader from "@/components/Loader";
import { getClerkUsers, getDocumentUsers } from "@/lib/actions/user.actions";
import { useUser } from "@clerk/nextjs";

const Provider = ({ children }: {children: ReactNode}) => {
  const { user: clerkUser } = useUser()

  return (
    <LiveblocksProvider 
      authEndpoint="/api/liveblocks-auth"
      resolveUsers={async ({ userIds }) => {
        const users = await getClerkUsers({ userIds });

        return users;
      }}
      // to be able to mention a user we have to figure out which users are in which room
      resolveMentionSuggestions={async({ text, roomId}) => {
        const roomUsers = await getDocumentUsers({
          roomId,
          currentUser: clerkUser?.emailAddresses[0].emailAddress!,
          text,
        })

        return roomUsers;
      }}
      > 
      <ClientSideSuspense fallback={<Loader />}>
        {children}
      </ClientSideSuspense>
    </LiveblocksProvider>
  )
}

export default Provider

// we use the Set up ID token permissions with Next.js from liveblocks authentication docs for the authEndpoint of the liveblocksProvider
// we follow the steps in the docs to create the endpoint
// then we wrap our children prop in the layout with this provider component
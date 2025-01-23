import CollaborativeRoom from '@/components/CollaborativeRoom'
import { getDocument } from '@/lib/actions/room.actions'
import { getClerkUsers } from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

const Document = async ({ params }: SearchParamProps) => {
  const { id } = params;

  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress
  })
  if(!room) redirect('/')

  // Access the permissions of the user to access the document by having access to their userIds
  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });
 
  // permission for all of the user
  const usersData = users.map((user: User) => ({
    /* to return an object you have to wrap the object curly braces inside a parenthesis otherwise it 
    will just be a basic function block*/
    ...user,
    userType: room.usersAccesses[user.email]?.includes('room:write') ? 'editor' : 'viewer'
  }));

  // permission for only the current user
  const currentUserType = room.usersAccesses[clerkUser.emailAddresses[0].emailAddress]?.includes('room:write') ? 'editor' : 'viewer';


  return (
    <main className='flex w-full flex-col items-center'>
      <CollaborativeRoom 
        roomId={id}
        roomMetadata={room.metadata}
        users = {usersData}
        currentUserType = {currentUserType}
      />
    </main>
  )
}

export default Document
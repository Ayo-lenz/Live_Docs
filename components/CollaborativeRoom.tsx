"use client";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react";
import { Editor } from "@/components/editor/Editor";
import Header from "@/components/Header";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import ActiveCollaborators from "./ActiveCollaborators";
import { Input } from "./ui/input";
import Image from "next/image";
import { P } from "@liveblocks/react/dist/room-0rxzsE_0";
import { updateDocument } from "@/lib/actions/room.actions";
import Loader from "./Loader";
import ShareModal from "./ShareModal";

const CollaborativeRoom = ({ roomId, roomMetadata, users, currentUserType }: CollaborativeRoomProps) => {
  
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // this function basically teaches us how to use keyboard events to handle events in react
  const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter') {
      setLoading(true);

      try {
        if(documentTitle !== roomMetadata.title) {
          const updatedDocument = await updateDocument(roomId, documentTitle);

          if(updatedDocument) {
            setEditing(false);
          }
        }
      } catch (error) {
        console.error(error)
      }

      setLoading(false);
    }
  }

  // this useEffect helps us to properly save the input we entered when we exit the input screen
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // the if statement here means we are no longer editing
      if (containerRef.current && !containerRef.current.contains(e.target as Node)){
        setEditing(false);
        updateDocument(roomId, documentTitle);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [roomId, documentTitle])
  
  // this useEffect will be recalled everytime we are editing or not editing because of the dependency array
  // it also helps in focusing on the input so the user knows that we are typing
  useEffect(() => {
    if(editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing])
  return (
    // the reason why we extracted the Room block from the liveblock into another component is that
    // we have multiple rooms for each of our documents
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header>
            {/* this first div contains the ability to edit the document title */}
            <div ref={containerRef} className="flex w-fit items-center justify-center gap-2">
              {editing && !loading ? (
                <Input
                  type="text"
                  value={documentTitle}
                  ref={inputRef}
                  placeholder="Enter title"
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  onKeyDown={updateTitleHandler}
                  disable={!editing} 
                  className="document-title-input"
                />
              ) : (
                <>
                  <p className="document-title">{documentTitle}</p>
                </>
              )}

              {/* when the setEditing is true that is when we will have the input above */}
              {currentUserType === 'editor' && !editing && (
                <Image
                  src="/assets/icons/edit.svg"
                  alt="edit"
                  width={24}
                  height={24}
                  onClick={() => setEditing(true)} 
                  className="pointer"
                />
              )}

              {currentUserType !== 'editor' && !editing &&(
                <p className="view-only-tag">View only</p>
              )}

              {loading && <p className="text-sm text-gray-400">saving...</p>}
            </div>
            <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
              <ActiveCollaborators />

              <ShareModal 
                roomId={roomId}
                collaborators={users}
                creatorId={roomMetadata.creatorId}
                currentUserType={currentUserType}
              />
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            </div>
          </Header>
          <Editor roomId={roomId} currentUserType={currentUserType}/>
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;

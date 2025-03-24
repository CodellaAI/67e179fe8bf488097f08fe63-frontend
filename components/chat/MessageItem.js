
import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { MoreHorizontal, Reply, Trash2, Edit } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function MessageItem({ message, isGrouped }) {
  const { user } = useAuth()
  const [showActions, setShowActions] = useState(false)
  const isAuthor = message.author._id === user?._id

  const formattedTime = format(new Date(message.createdAt), 'h:mm a')
  const formattedDate = format(new Date(message.createdAt), 'MMM dd, yyyy')

  return (
    <div 
      className={`py-0.5 px-4 hover:bg-discord-gray-lighter rounded relative group ${
        isGrouped ? 'mt-0.5' : 'mt-4'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isGrouped && (
        <div className="flex items-start">
          <Image
            src={message.author.avatar || `https://ui-avatars.com/api/?name=${message.author.username}&background=random`}
            alt={message.author.username}
            width={40}
            height={40}
            className="rounded-full mr-3"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <span className="font-medium text-white">{message.author.username}</span>
              <span className="text-xs text-discord-gray-muted ml-2">{formattedTime}</span>
            </div>
            <p className="text-discord-gray-text">{message.content}</p>
          </div>
        </div>
      )}

      {isGrouped && (
        <div className="flex items-start pl-[52px]">
          <p className="text-discord-gray-text group-hover:before:content-[attr(data-time)] group-hover:before:text-xs group-hover:before:text-discord-gray-muted group-hover:before:mr-2" data-time={formattedTime}>
            {message.content}
          </p>
        </div>
      )}

      {showActions && (
        <div className="absolute right-2 top-0 bg-discord-gray-dark rounded flex items-center shadow-md">
          <button className="p-2 text-discord-gray-muted hover:text-white">
            <Reply size={16} />
          </button>
          
          {isAuthor && (
            <>
              <button className="p-2 text-discord-gray-muted hover:text-white">
                <Edit size={16} />
              </button>
              <button className="p-2 text-discord-gray-muted hover:text-discord-red">
                <Trash2 size={16} />
              </button>
            </>
          )}
          
          <button className="p-2 text-discord-gray-muted hover:text-white">
            <MoreHorizontal size={16} />
          </button>
        </div>
      )}
    </div>
  )
}

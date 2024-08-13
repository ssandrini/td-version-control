import React from 'react'

interface HistoryItemProps {
    commit: string
}

const HistoryItem: React.FC<HistoryItemProps> = ({commit}) => {

    return (
        <div className="flex flex-row border-b-2 border-gray-900 h-20 px-4">
            <div className="flex flex-col h-full items-center">
                <div className="w-3 h-4 bg-yellow-300 rounded-full" />
                <div className="w-1 h-full bg-yellow-300" />
            </div>
            <div className="text-black font-bold">
                {commit}
            </div>
        </div>
    )
}

export default HistoryItem

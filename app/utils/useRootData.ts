import {useMatches} from 'remix'
import { handle } from '~/root'
import type { LoaderData } from '~/root'

function useMatchLoaderData<LoaderData>(handleId: string) {
    const matches = useMatches()
    const match = matches.find(
        ({handle}) => (handle)?.id === handleId,
    )
    if (!match) {
        throw new Error(`No active route has a handle ID of ${handleId}`)
    }
    return match.data as LoaderData
}

export const useRootData = () => useMatchLoaderData<LoaderData>(handle.id)
export function useUser() {
    const { user } = useRootData()
    if (!user) throw new Error('User is required when using useUser')
    return user
}
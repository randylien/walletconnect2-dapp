import SettingsStore from '@/store/SettingsStore'
import { createOrRestoreCosmosWallet } from '@/utils/CosmosWalletUtil'
import { createOrRestoreEIP155Wallet } from '@/utils/EIP155WalletUtil'
import { createOrRestoreSolanaWallet } from '@/utils/SolanaWalletUtil'
import { chatClient, createChatClient, createSignClient } from '@/utils/WalletConnectUtil'
import { useCallback, useEffect, useState } from 'react'

export default function useInitialization() {
  const [initialized, setInitialized] = useState(false)

  const onInitialize = useCallback(async () => {
    try {
      const { eip155Addresses } = createOrRestoreEIP155Wallet()
      const { cosmosAddresses } = await createOrRestoreCosmosWallet()
      const { solanaAddresses } = await createOrRestoreSolanaWallet()

      SettingsStore.setEIP155Address(eip155Addresses[0])
      SettingsStore.setCosmosAddress(cosmosAddresses[0])
      SettingsStore.setSolanaAddress(solanaAddresses[0])

      await createSignClient()

      await createChatClient()
      await chatClient.register({ account: `eip155:1:${eip155Addresses[0]}` })
      console.log('[Chat] registered address %s on keyserver', `eip155:1:${eip155Addresses[0]}`)

      setInitialized(true)
    } catch (err: unknown) {
      alert(err)
    }
  }, [])

  useEffect(() => {
    if (!initialized) {
      onInitialize()
    }
  }, [initialized, onInitialize])

  return initialized
}

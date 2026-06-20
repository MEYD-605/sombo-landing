"use client"
import { useState } from "react"
import { createWalletClient, custom } from "viem"
import { mainnet } from "viem/chains"

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
    }
  }
}

export default function ConnectWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  async function connect() {
    if (!window.ethereum) {
      alert("No wallet detected. Install MetaMask or a Web3 wallet.")
      return
    }
    setConnecting(true)
    try {
      const client = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum),
      })
      const [addr] = await client.requestAddresses()
      setAddress(addr)
    } catch (err) {
      console.error("Wallet connect error:", err)
    } finally {
      setConnecting(false)
    }
  }

  function truncate(addr: string) {
    return addr.slice(0, 6) + "..." + addr.slice(-4)
  }

  if (address) {
    return (
      <span class="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xs px-4 py-2.5 text-emerald-400 font-mono text-sm">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
        {truncate(address)}
      </span>
    )
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      className="px-6 py-2.5 bg-patina text-[oklch(7%_0.006_95)] hover:opacity-90 font-sans font-medium rounded-xs transition-colors cursor-pointer text-sm disabled:cursor-wait disabled:opacity-75"
    >
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  )
}

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
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          borderRadius: "8px",
          padding: "8px 16px",
          color: "#34d399",
          fontSize: "0.875rem",
          fontFamily: "monospace",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#34d399",
            display: "inline-block",
          }}
        />
        {truncate(address)}
      </span>
    )
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      style={{
        background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
        border: "none",
        borderRadius: "8px",
        padding: "10px 20px",
        color: "white",
        fontWeight: 600,
        fontSize: "0.875rem",
        cursor: connecting ? "wait" : "pointer",
        opacity: connecting ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  )
}

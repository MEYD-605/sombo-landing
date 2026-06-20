import { useState, useRef, useEffect, useCallback } from "react"

interface PDFViewerProps {
  url: string
  title: string
  cover?: string
}

export default function PDFViewer({ url, title, cover }: PDFViewerProps) {
  const [open, setOpen] = useState(false)
  const [pages, setPages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pdfRef = useRef<any>(null)

  const renderPage = useCallback(async (pageNum: number) => {
    if (!pdfRef.current || !canvasRef.current) return
    const page = await pdfRef.current.getPage(pageNum)
    const viewport = page.getViewport({ scale: 1.4 })
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({ canvasContext: ctx, viewport }).promise
  }, [])

  const loadPDF = useCallback(async () => {
    setLoading(true)
    try {
      const pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"
      const pdf = await pdfjsLib.getDocument(url).promise
      pdfRef.current = pdf
      setTotalPages(pdf.numPages)
      setCurrentPage(1)
      await renderPage(1)
    } catch (e) {
      console.error("PDF load error:", e)
    }
    setLoading(false)
  }, [url, renderPage])

  useEffect(() => {
    if (open && !pdfRef.current) {
      loadPDF()
    } else if (open && pdfRef.current) {
      renderPage(currentPage)
    }
  }, [open, currentPage, loadPDF, renderPage])

  const prev = () => currentPage > 1 && setCurrentPage((p) => p - 1)
  const next = () => currentPage < totalPages && setCurrentPage((p) => p + 1)

  return (
    <>
      {/* Book cover — click to open viewer */}
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "block",
          width: "100%",
          textAlign: "left",
        }}
        aria-label={`อ่าน ${title}`}
      >
        {cover ? (
          <img
            src={cover}
            alt={title}
            style={{
              width: "100%",
              borderRadius: "8px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLImageElement).style.transform = "scale(1.02)"
              ;(e.target as HTMLImageElement).style.boxShadow =
                "0 16px 48px rgba(139,92,246,0.3)"
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLImageElement).style.transform = "scale(1)"
              ;(e.target as HTMLImageElement).style.boxShadow =
                "0 8px 32px rgba(0,0,0,0.4)"
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              aspectRatio: "3/4",
              borderRadius: "8px",
              background:
                "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            📖
          </div>
        )}
        <p
          style={{
            marginTop: "10px",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--text)",
            lineHeight: 1.4,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--secondary)",
            marginTop: "4px",
          }}
        >
          กดเพื่ออ่าน PDF →
        </p>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "24px 16px",
            overflowY: "auto",
          }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          {/* Header bar */}
          <div
            style={{
              width: "100%",
              maxWidth: "860px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#e2e8f0",
                fontWeight: 600,
                fontSize: "0.9rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "60%",
              }}
            >
              {title}
            </span>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {totalPages > 0 && (
                <>
                  <button
                    onClick={prev}
                    disabled={currentPage <= 1}
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: currentPage <= 1 ? "#555" : "#e2e8f0",
                      borderRadius: "6px",
                      padding: "6px 14px",
                      cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    ←
                  </button>
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.8rem",
                      minWidth: "70px",
                      textAlign: "center",
                    }}
                  >
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={next}
                    disabled={currentPage >= totalPages}
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color:
                        currentPage >= totalPages ? "#555" : "#e2e8f0",
                      borderRadius: "6px",
                      padding: "6px 14px",
                      cursor:
                        currentPage >= totalPages
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    →
                  </button>
                </>
              )}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#e2e8f0",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                ✕ ปิด
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              overflow: "hidden",
              maxWidth: "860px",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {loading ? (
              <div
                style={{
                  padding: "80px",
                  color: "#666",
                  fontSize: "1rem",
                }}
              >
                กำลังโหลด PDF...
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                style={{ maxWidth: "100%", display: "block" }}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

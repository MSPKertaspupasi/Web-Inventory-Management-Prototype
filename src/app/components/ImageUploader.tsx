import { useRef, useState, useEffect } from "react"
import { createPortal } from "react-dom"

type Props = {
  onChange: (url: string) => void
}

export default function ImageUploader({
  onChange
}: Props) {

  const inputRef =
    useRef<HTMLInputElement>(null)

  const [preview, setPreview] =
    useState("")

  const [zoom, setZoom] =
    useState(false)

  const [scale, setScale] =
    useState(1)

  // Buat ref untuk mengontrol segel event native pada modal zoom
  const portalRef = useRef<HTMLDivElement>(null)

  const handleSelect = () => {
    if (preview) return
    inputRef.current?.click()
  }

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange(url)
  }

  // CORE ENGINE: Mengunci total event agar tidak bocor ke Modal Induk & mengaktifkan Scroll Zoom
  useEffect(() => {
    if (!zoom) return

    const wrapper = portalRef.current
    if (!wrapper) return

    // 1. Amankan mousedown & pointerdown agar modal induk tidak mengira ada aktivitas "click outside"
    const blockNativeBubbling = (e: Event) => {
      e.stopPropagation()
    }
    wrapper.addEventListener("mousedown", blockNativeBubbling)
    wrapper.addEventListener("mouseup", blockNativeBubbling)
    wrapper.addEventListener("pointerdown", blockNativeBubbling)

    // 2. FIX BUG 1: Scroll Zoom super smooth dengan mengunci scroll asli halaman bawaan
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault() // Kunci halaman belakang agar tidak ikut ter-scroll
      e.stopPropagation()
      if (e.deltaY < 0) {
        setScale(v => Math.min(5, v + 0.25)) // Zoom In
      } else {
        setScale(v => Math.max(1, v - 0.25)) // Zoom Out
      }
    }
    wrapper.addEventListener("wheel", handleWheel, { passive: false })

    // 3. FIX BUG 2: Handle klik penutup secara native agar event berhenti total di sini
    const handleClick = (e: MouseEvent) => {
      e.stopPropagation()
      const target = e.target as HTMLElement

      // Jika klik area hitam backdrop, tombol silang, atau gambar utama -> Tutup Zoom
      if (
        target.id === "zoom-backdrop" || 
        target.id === "zoom-btn-close" || 
        target.id === "zoom-img" ||
        target.closest("#zoom-btn-close")
      ) {
        setZoom(false)
        setScale(1)
        return
      }

      // Handle tombol minus slider secara native
      if (target.id === "zoom-btn-minus" || target.closest("#zoom-btn-minus")) {
        setScale(v => Math.max(1, v - 0.25))
        return
      }

      // Handle tombol plus slider secara native
      if (target.id === "zoom-btn-plus" || target.closest("#zoom-btn-plus")) {
        setScale(v => Math.min(5, v + 0.25))
        return
      }
    }
    wrapper.addEventListener("click", handleClick)

    // 4. Handle pergeseran slider range input secara native
    const rangeInput = wrapper.querySelector("#zoom-range") as HTMLInputElement
    const handleRange = (e: Event) => {
      setScale(Number((e.target as HTMLInputElement).value))
    }
    if (rangeInput) {
      rangeInput.addEventListener("input", handleRange)
    }

    return () => {
      wrapper.removeEventListener("mousedown", blockNativeBubbling)
      wrapper.removeEventListener("mouseup", blockNativeBubbling)
      wrapper.removeEventListener("pointerdown", blockNativeBubbling)
      wrapper.removeEventListener("wheel", handleWheel)
      wrapper.removeEventListener("click", handleClick)
      if (rangeInput) {
        rangeInput.removeEventListener("input", handleRange)
      }
    }
  }, [zoom])

  return (
    <>
      <div className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        <div
          onClick={handleSelect}
          className="
          relative
          rounded-2xl
          border-2
          border-dashed
          border-slate-300
          overflow-hidden
          bg-slate-100
          "
        >
          {preview ? (
            <>
              <div
                className="
                relative
                w-full
                bg-slate-900
                flex
                items-center
                justify-center
                "
              >
                <img
                  src={preview}
                  onClick={(e) => {
                    e.stopPropagation()
                    setZoom(true)
                  }}
                  className="
                  w-full
                  h-auto
                  max-h-[320px]
                  object-contain
                  cursor-zoom-in
                  "
                />

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    inputRef.current?.click()
                  }}
                  className="
                  absolute
                  bottom-3
                  right-3
                  px-3
                  py-1
                  rounded-full
                  text-xs
                  text-white
                  bg-black/60
                  backdrop-blur
                  "
                >
                  Ganti
                </button>
              </div>
            </>
          ) : (
            <div
              className="
              h-[220px]
              flex
              flex-col
              items-center
              justify-center
              gap-3
              "
            >
              <div className="text-5xl">📷</div>
              <p className="text-sm text-slate-500">
                Tambah Foto Barang
              </p>
              <p className="text-xs text-slate-400">
                JPG • PNG • WEBP
              </p>
            </div>
          )}
        </div>

        {/* MODAL ZOOM FULLSCREEN - SECURE PORTAL */}
        {zoom && createPortal(
          <div
            ref={portalRef}
            className="
            fixed
            inset-0
            z-[99999]
            bg-black/90
            flex
            items-center
            justify-center
            select-none
            "
          >
            {/* Backdrop Area Hitam */}
            <div id="zoom-backdrop" className="absolute inset-0" />

            <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
              {/* Gambar Utama */}
              <img
                id="zoom-img"
                src={preview}
                style={{
                  transform: `scale(${scale})`
                }}
                className="
                w-auto
                h-auto
                max-w-[92vw]
                max-h-[82vh]
                object-contain
                transition-transform
                duration-150
                cursor-zoom-out
                pointer-events-auto
                "
              />

              {/* CONTROLLER CONTROLS */}
              <div
                className="
                absolute
                bottom-10
                left-1/2
                -translate-x-1/2
                flex
                items-center
                gap-3
                px-3
                py-2
                rounded-full
                bg-black/75
                backdrop-blur-xl
                pointer-events-auto
                "
              >
                <button
                  type="button"
                  id="zoom-btn-minus"
                  className="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center font-bold"
                >
                  −
                </button>
                <input
                  type="range"
                  id="zoom-range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={scale}
                  className="ios-slider w-28"
                  readOnly
                />
                <button
                  type="button"
                  id="zoom-btn-plus"
                  className="w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>

              {/* TOMBOL X CLOSE */}
              <button
                id="zoom-btn-close"
                className="
                absolute
                top-6
                right-6
                w-10
                h-10
                rounded-full
                bg-black/60
                text-white
                flex
                items-center
                justify-center
                text-lg
                pointer-events-auto
                "
              >
                ✕
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>

      <style>
        {`
        .ios-slider {
          appearance:none;
          height:4px;
          border-radius:999px;
          background: rgba(255, 255, 255, 0.25);
        }
        .ios-slider::-webkit-slider-thumb {
          appearance:none;
          width:14px;
          height:14px;
          border-radius:999px;
          background:white;
          cursor:pointer;
        }
        `}
      </style>
    </>
  )
}
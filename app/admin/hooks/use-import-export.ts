"use client"

import { useState } from "react"
import type { ChangeEvent } from "react"
import { fetchApi } from "@/lib/api-client"
import { unduhFile } from "../utils"
import type { HasilImport, TampilkanNotifikasi } from "../types"

interface UseImportExportParams {
  showNotification: TampilkanNotifikasi
  fetchRingkasanGlobal: () => Promise<void>
  muatUlangSiswa: () => void
}

export function useImportExport({
  showNotification,
  fetchRingkasanGlobal,
  muatUlangSiswa,
}: UseImportExportParams) {
  // State khusus fitur import & export data murid
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [hasilImport, setHasilImport] = useState<HasilImport | null>(null)

  const handleEkspor = async (format: "csv" | "xlsx") => {
    if (isExporting) return
    setIsExporting(true)

    try {
      await unduhFile(`/api/murid/export?format=${format}`, `data-murid.${format}`)
      showNotification("Sukses", `Data murid berhasil diekspor ke ${format.toUpperCase()}.`, true)
    } catch (error) {
      showNotification(
        "Gagal Mengekspor",
        error instanceof Error ? error.message : "Terjadi kesalahan saat mengekspor data.",
        false,
      )
    } finally {
      setIsExporting(false)
    }
  }

  const handleEksporTemplate = async () => {
    if (isExporting) return
    setIsExporting(true)

    try {
      await unduhFile("/api/murid/export?template=1", "template-import-murid.csv")
    } catch (error) {
      showNotification(
        "Gagal Mengunduh Template",
        error instanceof Error ? error.message : "Terjadi kesalahan saat mengunduh template.",
        false,
      )
    } finally {
      setIsExporting(false)
    }
  }

  const handleBerkasDipilih = async (e: ChangeEvent<HTMLInputElement>) => {
    const berkas = e.target.files?.[0]
    e.target.value = "" // reset agar file yang sama bisa dipilih ulang
    if (!berkas) return

    setIsImporting(true)

    try {
      const formData = new FormData()
      formData.append("file", berkas)

      const res = await fetchApi("/api/murid/import", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        showNotification("Gagal Mengimpor", data.message || "Import data murid gagal.", false)
        return
      }

      setHasilImport(data)
      fetchRingkasanGlobal()
      muatUlangSiswa()
    } catch {
      showNotification("Error", "Terjadi kesalahan jaringan saat mengimpor data.", false)
    } finally {
      setIsImporting(false)
    }
  }

  const tutupHasilImport = () => {
    setHasilImport(null)
  }

  return {
    isExporting,
    isImporting,
    hasilImport,
    handleEkspor,
    handleEksporTemplate,
    handleBerkasDipilih,
    tutupHasilImport,
  }
}

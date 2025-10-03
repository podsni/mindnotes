# PDF & CSV Support Feature

## Overview
MindNote sekarang mendukung attachment file PDF dan CSV yang dapat dibuka, dilihat, dan dikelola secara offline. Semua file disimpan di IndexedDB untuk pengalaman offline-first.

## Fitur PDF

### 1. **PDF Viewer**
- Preview PDF langsung di dalam aplikasi menggunakan PDF.js
- Navigasi halaman dengan tombol Previous/Next
- Zoom in/out dengan kontrol zoom (50% - 300%)
- Responsive dan touch-friendly untuk mobile

### 2. **Pencarian dalam PDF**
- Search text dalam seluruh dokumen PDF
- Menampilkan jumlah hasil yang ditemukan
- Text extraction menggunakan PDF.js

### 3. **Annotation (Komentar)**
- Mode annotation dengan tool comment
- Klik pada canvas PDF untuk menambahkan komentar
- Komentar disimpan dengan posisi (x, y) per halaman
- Setiap annotation memiliki:
  - Konten text komentar
  - Timestamp kapan dibuat
  - Posisi di halaman tertentu
  - Bubble icon untuk melihat/menghapus

### 4. **Metadata**
- Otomatis menyimpan jumlah halaman
- Menyimpan semua annotations dalam metadata
- Tersimpan di IndexedDB bersama file blob

## Fitur CSV

### 1. **CSV Viewer & Parser**
- Import CSV dengan parsing otomatis menggunakan PapaParse
- Render tabel interaktif dengan header dan data
- Deteksi otomatis delimiter dan format CSV

### 2. **Fitur Tabel**
- **Sorting**: Klik pada header kolom untuk sort ascending/descending
  - Numeric sort untuk angka
  - Alphabetical sort untuk text
  - Visual indicator arah sorting (▲/▼)
- **Search/Filter**: Search box untuk filter baris yang mengandung query
- **Row counter**: Menampilkan total rows × columns dan filtered count

### 3. **Edit Mode**
- Toggle edit mode untuk mengubah data tabel
- Edit cell langsung dengan input field
- Tambah row baru dengan tombol "Add Row"
- Hapus row dengan tombol delete per row
- Save changes atau cancel untuk discard

### 4. **Export**
- **Export CSV**: Download kembali sebagai file .csv
- **Export JSON**: Convert dan download sebagai .json dengan structure:
  ```json
  [
    { "header1": "value1", "header2": "value2" },
    { "header1": "value3", "header2": "value4" }
  ]
  ```

### 5. **Metadata**
- Row count (jumlah baris)
- Column count (jumlah kolom)
- Headers (nama kolom)

## Storage & Database

### IndexedDB Schema
```typescript
// Tabel attachments (versi 4)
interface Attachment {
  id?: number
  noteId: number
  type: 'pdf' | 'csv' | 'image'
  filename: string
  fileBlob: Blob
  fileSize: number
  uploadedAt: number
  metadata?: {
    // PDF
    pageCount?: number
    annotations?: PDFAnnotation[]
    // CSV
    rowCount?: number
    columnCount?: number
    headers?: string[]
  }
}

interface PDFAnnotation {
  id: string
  pageNumber: number
  type: 'highlight' | 'comment' | 'sticky'
  content?: string
  color?: string
  position: { x: number; y: number; width?: number; height?: number }
  createdAt: number
}
```

### Storage API
- `attachmentService.addAttachment(noteId, file, type, metadata)` - Upload file
- `attachmentService.getAttachmentsByNote(noteId)` - Get all attachments for note
- `attachmentService.getAttachment(id)` - Get single attachment
- `attachmentService.deleteAttachment(id)` - Delete attachment
- `attachmentService.updateAttachmentMetadata(id, metadata)` - Update metadata
- `attachmentService.addPDFAnnotation(attachmentId, annotation)` - Add annotation
- `attachmentService.deletePDFAnnotation(attachmentId, annotationId)` - Delete annotation
- `attachmentService.getStorageUsed()` - Get total storage in bytes

## Komponen

### 1. **AttachmentManager.svelte**
- Main component untuk manage attachments
- Grid view untuk list semua attachments
- Upload dialog untuk add file baru
- Route ke viewer berdasarkan file type
- File size formatter dan file type icons

### 2. **PDFViewer.svelte**
- Full PDF viewer dengan toolbar
- Canvas rendering dengan PDF.js
- Annotation overlay layer
- Comment input modal
- Page navigation dan zoom controls

### 3. **CSVViewer.svelte**
- Table component dengan Tabulator-like features
- Edit mode dengan cell input
- Sort, search, filter functionality
- Export to CSV/JSON

### 4. **Editor.svelte (Updated)**
- Tambah tab "Attachments" di samping tab "Note"
- Seamless navigation antara editor dan attachments
- Preserve editor state saat switch tab

## User Flow

### Upload File
1. Buka note yang ingin ditambahkan attachment
2. Klik tab "📎 Attachments"
3. Klik "➕ Add File"
4. Pilih file PDF, CSV, atau gambar
5. File otomatis terupload dan tersimpan di IndexedDB

### View PDF
1. Dari attachment list, klik tombol "👁️ View"
2. PDF viewer terbuka dengan page 1
3. Gunakan Next/Prev untuk navigasi
4. Zoom in/out sesuai kebutuhan
5. Search text dengan search box
6. Klik "💬 Comment" untuk add annotation
7. Klik pada canvas untuk place comment
8. Tulis komentar dan klik "Save"

### Edit CSV
1. Dari attachment list, klik "👁️ View" pada file CSV
2. CSV viewer terbuka dengan tabel data
3. Gunakan search untuk filter data
4. Klik header kolom untuk sort
5. Klik "✏️ Edit" untuk masuk edit mode
6. Edit cell, tambah/hapus row
7. Klik "💾 Save" untuk simpan perubahan
8. Atau "❌ Cancel" untuk discard

### Download Attachment
- Klik tombol "📥 Download" di card atau viewer
- File akan didownload ke device

### Delete Attachment
- Klik tombol "🗑️ Delete" di attachment card
- Konfirmasi delete (cannot be undone)
- File dan semua metadata terhapus dari IndexedDB

## Performance

### Optimizations
- **Lazy loading**: Attachment list hanya load metadata, tidak load blob sampai dibuka
- **Blob storage**: File disimpan sebagai Blob di IndexedDB (efficient binary storage)
- **Canvas rendering**: PDF render per page, tidak load semua pages sekaligus
- **Debounced search**: CSV search dengan debounce untuk avoid re-render berlebihan
- **Virtual scrolling ready**: Table component bisa diintegrasikan dengan virtual list untuk dataset besar

### File Size Recommendations
- PDF: Optimal < 10MB, Max ~50MB (browser dependent)
- CSV: Optimal < 1000 rows, Max ~10,000 rows untuk smooth editing
- Images: Optimal < 5MB

### Browser Storage
- IndexedDB quota: Biasanya ~50% available disk space atau minimum 50MB
- Bisa check storage used dengan `attachmentService.getStorageUsed()`
- PWA persistent storage otomatis di-request untuk prevent eviction

## Stack & Dependencies

### PDF Support
- **pdfjs-dist** (v5.4.149): Official PDF.js library untuk rendering PDF
- Worker: CDN-hosted worker untuk background processing
- Canvas API: Native HTML5 canvas untuk render PDF pages

### CSV Support
- **papaparse** (v5.5.3): Fast CSV parser dengan auto-delimiter detection
- **tabulator-tables** (v6.3.1): Powerful table library (available untuk advanced features)
- Native HTML table untuk performance

### Storage
- **Dexie.js**: Already used, extended dengan `attachments` table
- **File API**: untuk read file uploads
- **Blob API**: untuk store binary data

## Offline Support

✅ **Fully Offline Capable**
- Semua file disimpan lokal di IndexedDB
- PDF.js worker di-load dari CDN (cached by service worker)
- Bisa view, edit, dan manage attachments tanpa internet
- PWA service worker precache semua assets

## Future Enhancements

### PDF
- [ ] Highlight annotation (text selection + color)
- [ ] Sticky note annotation (draggable notes)
- [ ] Link to specific page: `[See PDF page 23](#pdf:123:23)`
- [ ] Export annotations as separate note
- [ ] PDF thumbnail preview

### CSV
- [ ] Chart generation dari CSV data
- [ ] Formula support (basic calculations)
- [ ] Import from Google Sheets / Excel
- [ ] Cell formatting (bold, color, alignment)
- [ ] Virtual scrolling untuk >10k rows

### General
- [ ] Image annotation (crop, rotate, markup)
- [ ] Audio/video attachments
- [ ] Attachment search (search in PDF content, CSV data)
- [ ] Attachment linking between notes
- [ ] Cloud sync untuk attachments (optional backend)

## Testing

### Manual Test Checklist
- [x] Upload PDF file
- [x] Navigate PDF pages
- [x] Zoom PDF in/out
- [x] Search in PDF
- [x] Add PDF comment
- [x] Delete PDF comment
- [x] Upload CSV file
- [x] Sort CSV columns
- [x] Search/filter CSV
- [x] Edit CSV mode
- [x] Add/delete CSV rows
- [x] Save CSV changes
- [x] Export CSV
- [x] Export JSON
- [x] Download attachment
- [x] Delete attachment
- [x] Switch between editor and attachments tab

### Build Status
✅ Type check passed: `pnpm check`
✅ Build successful: `pnpm build`
✅ No TypeScript errors
✅ No Svelte warnings (accessibility handled)

## Files Modified/Added

### Added Components
- `src/lib/PDFViewer.svelte` - PDF viewer with annotations
- `src/lib/CSVViewer.svelte` - CSV table viewer/editor
- `src/lib/AttachmentManager.svelte` - Attachment list and upload

### Modified Files
- `src/lib/db.ts` - Added Attachment schema, attachmentService API
- `src/lib/Editor.svelte` - Added attachments tab

### Dependencies Added
```json
{
  "dependencies": {
    "pdfjs-dist": "^5.4.149",
    "papaparse": "^5.5.3",
    "tabulator-tables": "^6.3.1"
  },
  "devDependencies": {
    "@types/papaparse": "^5.3.16"
  }
}
```

## Usage Example

```typescript
// Upload PDF
const file = document.querySelector('input[type=file]').files[0]
const id = await attachmentService.addAttachment(noteId, file, 'pdf', {
  pageCount: 10
})

// Get attachments for note
const attachments = await attachmentService.getAttachmentsByNote(noteId)

// Add annotation
const annotation: PDFAnnotation = {
  id: crypto.randomUUID(),
  pageNumber: 5,
  type: 'comment',
  content: 'Important point here!',
  position: { x: 100, y: 200 },
  createdAt: Date.now()
}
await attachmentService.addPDFAnnotation(attachmentId, annotation)
```

---

**Fitur PDF dan CSV support sudah siap digunakan! 🎉**

Untuk memulai:
1. `pnpm dev` - Start development server
2. Buka note atau buat note baru
3. Klik tab "📎 Attachments"
4. Upload PDF atau CSV file
5. Enjoy offline-capable file viewing and editing!

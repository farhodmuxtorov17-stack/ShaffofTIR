<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud, File as FileIcon, X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    accept?: string
    label?: string
    multiple?: boolean
  }>(),
  {
    accept: 'image/*',
    label: 'Faylni tanlang yoki shu yerga sudrab tashlang',
    multiple: false,
  }
)

const emit = defineEmits<{
  (e: 'files', files: File[]): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragActive = ref(false)
const selectedFiles = ref<File[]>([])

const triggerBrowse = () => {
  fileInput.value?.click()
}

const processFiles = (filesList: FileList | null) => {
  if (!filesList) return
  const filesArray = Array.from(filesList)

  if (props.multiple) {
    selectedFiles.value = [...selectedFiles.value, ...filesArray]
  } else {
    selectedFiles.value = filesArray.slice(0, 1)
  }

  emit('files', selectedFiles.value)
}

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  processFiles(target.files)
}

const onDragEnter = () => {
  isDragActive.value = true
}

const onDragOver = () => {
  isDragActive.value = true
}

const onDragLeave = () => {
  isDragActive.value = false
}

const onDrop = (e: DragEvent) => {
  isDragActive.value = false
  if (e.dataTransfer?.files) {
    processFiles(e.dataTransfer.files)
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  emit('files', selectedFiles.value)
}
</script>

<template>
  <div class="w-full">
    <!-- Drop Zone -->
    <div
      class="border-2 border-dashed rounded-card p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none text-center"
      :class="[
        isDragActive
          ? 'border-brand-500 bg-brand-50/50 text-brand-800 scale-[0.99]'
          : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 text-gray-500'
      ]"
      @click="triggerBrowse"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInput"
        type="file"
        class="hidden"
        :accept="accept"
        :multiple="multiple"
        @change="onFileChange"
      />

      <UploadCloud
        class="w-12 h-12 mb-3 transition-colors"
        :class="isDragActive ? 'text-brand-600 animate-bounce' : 'text-gray-400'"
      />

      <p class="text-sm font-semibold text-gray-800 mb-1">
        {{ label }}
      </p>

      <p class="text-xs text-gray-400">
        Qabul qilinadigan format: {{ accept }}
      </p>
    </div>

    <!-- Selected Files List -->
    <div v-if="selectedFiles.length > 0" class="mt-4 flex flex-col gap-2">
      <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider">
        Tanlangan fayllar:
      </h4>
      <div
        v-for="(file, idx) in selectedFiles"
        :key="`${file.name}-${idx}`"
        class="flex items-center justify-between border border-shell-border rounded-btn bg-white px-4 py-2.5 shadow-sm text-sm"
      >
        <div class="flex items-center gap-3 min-w-0">
          <FileIcon class="w-4 h-4 text-brand-600 shrink-0" />
          <span class="truncate font-medium text-gray-700">
            {{ file.name }}
          </span>
          <span class="text-xs text-gray-400 shrink-0 font-mono">
            ({{ (file.size / 1024).toFixed(1) }} KB)
          </span>
        </div>
        <button
          type="button"
          class="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
          @click.stop="removeFile(idx)"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

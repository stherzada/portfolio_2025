<script setup lang="ts">
import { ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Minus, Image as ImageIcon, Loader2
} from 'lucide-vue-next'
import { uploadImage } from '@/services/admin'

const props = defineProps<{ editor: Editor | undefined }>()

const fileInputRef = ref<HTMLInputElement>()
const isUploading = ref(false)

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !props.editor) return
  isUploading.value = true
  try {
    const url = await uploadImage(file)
    props.editor.chain().focus().setImage({ src: url }).run()
  } catch (err) {
    console.error('Image upload failed:', err)
  } finally {
    isUploading.value = false
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const btn = 'p-1.5 rounded hover:bg-[var(--color-base-300)] transition-colors cursor-pointer disabled:opacity-40'
const activeBtn = 'bg-[var(--color-base-300)]'
</script>

<template>
  <div class="flex flex-wrap items-center gap-1 p-2 border-b border-[var(--color-base-300)]">
    <button
      type="button"
      :class="[btn, editor?.isActive('bold') ? activeBtn : '']"
      @click="editor?.chain().focus().toggleBold().run()"
      title="Negrito"
    >
      <Bold class="w-4 h-4" />
    </button>
    <button
      type="button"
      :class="[btn, editor?.isActive('italic') ? activeBtn : '']"
      @click="editor?.chain().focus().toggleItalic().run()"
      title="Itálico"
    >
      <Italic class="w-4 h-4" />
    </button>

    <div class="w-px h-5 bg-[var(--color-base-300)] mx-1" />

    <button
      type="button"
      :class="[btn, editor?.isActive('heading', { level: 2 }) ? activeBtn : '']"
      @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      title="Título H2"
    >
      <Heading2 class="w-4 h-4" />
    </button>
    <button
      type="button"
      :class="[btn, editor?.isActive('heading', { level: 3 }) ? activeBtn : '']"
      @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      title="Título H3"
    >
      <Heading3 class="w-4 h-4" />
    </button>

    <div class="w-px h-5 bg-[var(--color-base-300)] mx-1" />

    <button
      type="button"
      :class="[btn, editor?.isActive('bulletList') ? activeBtn : '']"
      @click="editor?.chain().focus().toggleBulletList().run()"
      title="Lista"
    >
      <List class="w-4 h-4" />
    </button>
    <button
      type="button"
      :class="[btn, editor?.isActive('orderedList') ? activeBtn : '']"
      @click="editor?.chain().focus().toggleOrderedList().run()"
      title="Lista numerada"
    >
      <ListOrdered class="w-4 h-4" />
    </button>
    <button
      type="button"
      :class="[btn, editor?.isActive('blockquote') ? activeBtn : '']"
      @click="editor?.chain().focus().toggleBlockquote().run()"
      title="Citação"
    >
      <Quote class="w-4 h-4" />
    </button>
    <button
      type="button"
      :class="btn"
      @click="editor?.chain().focus().setHorizontalRule().run()"
      title="Divisor"
    >
      <Minus class="w-4 h-4" />
    </button>

    <div class="w-px h-5 bg-[var(--color-base-300)] mx-1" />

    <button
      type="button"
      :class="btn"
      :disabled="isUploading"
      @click="fileInputRef?.click()"
      title="Inserir imagem"
    >
      <Loader2 v-if="isUploading" class="w-4 h-4 animate-spin" />
      <ImageIcon v-else class="w-4 h-4" />
    </button>
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleImageUpload"
    />
  </div>
</template>

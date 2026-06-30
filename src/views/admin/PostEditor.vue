<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { useDebounceFn } from '@vueuse/core'
import { ArrowLeft, ImagePlus } from 'lucide-vue-next'
import EditorToolbar from '@/components/admin/EditorToolbar.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { fetchPostById } from '@/services/blog'
import { createPost, updatePost, uploadImage, type PostInput } from '@/services/admin'
import { slugify } from '@/utils/slugify'
import store from '@/store'

const route = useRoute()
const router = useRouter()

const isEditMode = computed(() => !!route.params.id)

interface FormState extends PostInput {
  id?: string
}

const form = reactive<FormState>({
  title: '',
  description: '',
  slug: '',
  content: '',
  image_path: undefined,
})

const slugManuallyEdited = ref(false)
const coverImageFile = ref<File | null>(null)
const coverImagePreview = ref<string | null>(null)
const isSaving = ref(false)
const isLoading = ref(false)
const error = ref('')

const editor = useEditor({
  extensions: [
    StarterKit,
    Image.configure({ inline: false, allowBase64: false }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm md:prose-lg prose-gray max-w-none prose-headings:text-primary prose-a:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-p:leading-relaxed prose-li:leading-relaxed focus:outline-none min-h-96 p-4',
    },
  },
  onUpdate: ({ editor }) => {
    form.content = editor.getHTML()
  },
})

watch(
  () => form.title,
  useDebounceFn((title: string) => {
    if (!slugManuallyEdited.value) {
      form.slug = slugify(title)
    }
  }, 400),
)

const handleSlugInput = () => {
  slugManuallyEdited.value = true
}

const handleCoverImageChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  coverImageFile.value = file
  coverImagePreview.value = URL.createObjectURL(file)
}

const loadPost = async (id: string) => {
  isLoading.value = true
  try {
    const post = await fetchPostById(id)
    form.id = post.id
    form.title = post.title
    form.description = post.description
    form.slug = post.slug ?? ''
    form.content = post.content ?? ''
    form.image_path = post.image_path
    coverImagePreview.value = post.image_path ?? null
    slugManuallyEdited.value = true
    editor.value?.commands.setContent(post.content ?? '')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (isEditMode.value) {
    await loadPost(route.params.id as string)
  }
})

watch(
  () => route.params.id,
  async (newId) => {
    if (newId && typeof newId === 'string') {
      await loadPost(newId)
    }
  },
)

const handleSubmit = async () => {
  if (isEditMode.value && !form.id) {
    error.value = 'Post não encontrado. Recarregue a página.'
    return
  }
  isSaving.value = true
  error.value = ''
  try {
    if (coverImageFile.value) {
      form.image_path = await uploadImage(coverImageFile.value)
    }

    const payload: PostInput = {
      title: form.title,
      description: form.description,
      slug: form.slug,
      content: form.content,
      image_path: form.image_path,
    }

    if (isEditMode.value && form.id) {
      await updatePost(form.id, payload)
    } else {
      await createPost(payload)
    }

    store.posts = []
    router.push({ name: 'AdminDashboard', query: { saved: '1' } })
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Erro ao salvar'
  } finally {
    isSaving.value = false
  }
}

onUnmounted(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-10 flex items-center justify-between px-6 py-3
                   border-b border-[var(--color-base-300)] bg-[var(--color-base-100)]">
      <div class="flex items-center gap-3">
        <router-link
          :to="{ name: 'AdminDashboard' }"
          class="p-1.5 rounded-lg hover:bg-[var(--color-base-200)] transition-colors cursor-pointer"
        >
          <ArrowLeft class="w-5 h-5 text-primary" />
        </router-link>
        <h1 class="text-lg font-semibold text-primary">
          {{ isEditMode ? 'Editar post' : 'Novo post' }}
        </h1>
      </div>
      <div class="flex items-center gap-3">
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <ThemeToggle />
        <button
          type="button"
          :disabled="isSaving || isLoading"
          @click="handleSubmit"
          class="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-base-100)] rounded-lg
                 font-medium text-sm transition-opacity disabled:opacity-60 cursor-pointer"
        >
          {{ isSaving ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </header>

    <div v-if="isLoading" class="flex items-center justify-center py-24 text-[var(--color-base-content-secondary)]">
      Carregando...
    </div>

    <div v-else class="max-w-5xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
      <aside class="lg:w-72 shrink-0 flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-primary mb-1">Título</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Título do post"
            class="w-full px-3 py-2 border border-[var(--color-base-300)] rounded-lg
                   bg-[var(--color-base-100)] text-primary focus:outline-none
                   focus:border-primary transition-colors text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-primary mb-1">Slug</label>
          <input
            v-model="form.slug"
            type="text"
            placeholder="meu-post"
            @input="handleSlugInput"
            class="w-full px-3 py-2 border border-[var(--color-base-300)] rounded-lg
                   bg-[var(--color-base-100)] text-primary focus:outline-none
                   focus:border-primary transition-colors text-sm font-mono"
          />
          <p class="text-xs text-[var(--color-base-content-secondary)] mt-1">
            Gerado automaticamente. Deve ser único.
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-primary mb-1">Descrição</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Resumo do post..."
            class="w-full px-3 py-2 border border-[var(--color-base-300)] rounded-lg
                   bg-[var(--color-base-100)] text-primary focus:outline-none
                   focus:border-primary transition-colors text-sm resize-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-primary mb-2">Imagem de capa</label>
          <div
            class="relative rounded-lg border-2 border-dashed border-[var(--color-base-300)]
                   overflow-hidden cursor-pointer hover:border-primary transition-colors"
            @click="($refs.coverInput as HTMLInputElement)?.click()"
          >
            <img
              v-if="coverImagePreview"
              :src="coverImagePreview"
              alt="Capa"
              class="w-full h-40 object-cover"
            />
            <div
              v-else
              class="flex flex-col items-center justify-center h-40 gap-2
                     text-[var(--color-base-content-secondary)]"
            >
              <ImagePlus class="w-8 h-8" />
              <span class="text-sm">Clique para enviar</span>
            </div>
          </div>
          <input
            ref="coverInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleCoverImageChange"
          />
        </div>
      </aside>

      <div class="flex-1 min-w-0">
        <div class="rounded-xl border border-[var(--color-base-300)] bg-[var(--color-base-100)] overflow-hidden">
          <EditorToolbar :editor="editor" />
          <EditorContent :editor="editor" />
        </div>
      </div>
    </div>
  </div>
</template>

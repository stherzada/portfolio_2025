import { createRouter, createWebHistory } from "vue-router";
import { fetchPostBySlug } from "@/services/blog";
import { useMeta } from "@/composables/useMeta";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/Home.vue"),
      beforeEnter: (_to, _from, next) => {
        const { updateTitle, updateMetaTag, updateCanonical } = useMeta();

        updateTitle("Sthefany Sther - Software Engineer");
        updateMetaTag(
          "description",
          "Portfolio de Sthefany Sther, Desenvolvedora de Software que curte gestão e análise de dados. Conheça meus projetos e experiências em tecnologia.",
        );
        updateCanonical(`${window.location.origin}`);
        next();
      },
    },
    {
      path: "/blog",
      name: "Blog",
      component: () => import("@/views/Blog.vue"),
      beforeEnter: (_to, _from, next) => {
        const { updateTitle, updateMetaTag, updateCanonical } = useMeta();

        updateTitle("Blog - Sthefany Sther");
        updateMetaTag(
          "description",
          "Aqui você pode encontrar meus pensamentos e ideias sobre tecnologia, programação e outros tópicos.",
        );
        updateCanonical(`${window.location.origin}/blog`);
        next();
      },
    },
    {
      path: "/blog/:slug",
      name: "BlogPost",
      component: () => import("@/views/BlogPost.vue"),
      beforeEnter: async (to, _from, next) => {
          const slug = to.params.slug as string;
          const postData = await fetchPostBySlug(slug);
          const { updateTitle, updateMetaTag, updateCanonical } = useMeta();

          updateTitle(`${postData.title}`);
          updateMetaTag(
            "description",
            postData.description ||
              "Leia mais sobre este post no blog da Sthefany Sther",
          );
          updateCanonical(`${window.location.origin}/blog/${postData.slug}`);
          to.meta.postData = postData;
          next();
      },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

export default router;

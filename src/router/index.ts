import { createRouter, createWebHistory } from "vue-router";
import { fetchPostBySlug } from "@/services/blog";
import { useMeta } from "@/composables/useMeta";
import { useAuth } from "@/composables/useAuth";
import supabase from "@/supabase";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/Home.vue"),
      beforeEnter: (_to, _from, next) => {
        const { setMeta } = useMeta();
        const origin = window.location.origin;
        const description =
          "Portfolio de Sthefany Sther, Desenvolvedora de Software que curte gestão e análise de dados. Conheça meus projetos e experiências em tecnologia.";
        const image = `${origin}/Logo.png`;

        setMeta({
          title: "Sthefany Sther - Software Engineer",
          description,
          canonical: origin,
          ogType: "website",
          ogTitle: "Sthefany Sther - Software Engineer",
          ogDescription: description,
          ogImage: image,
          ogUrl: origin,
          twitterTitle: "Sthefany Sther - Software Engineer",
          twitterDescription: description,
          twitterImage: image,
        });
        next();
      },
    },
    {
      path: "/blog",
      name: "Blog",
      component: () => import("@/views/Blog.vue"),
      beforeEnter: (_to, _from, next) => {
        const { setMeta } = useMeta();
        const origin = window.location.origin;
        const canonical = `${origin}/blog`;
        const description =
          "Aqui você pode encontrar meus pensamentos e ideias sobre tecnologia, programação e outros tópicos.";
        const image = `${origin}/Logo.png`;

        setMeta({
          title: "Blog - Sthefany Sther",
          description,
          canonical,
          ogType: "website",
          ogTitle: "Blog - Sthefany Sther",
          ogDescription: description,
          ogImage: image,
          ogUrl: canonical,
          twitterTitle: "Blog - Sthefany Sther",
          twitterDescription: description,
          twitterImage: image,
        });
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
          const { setMeta } = useMeta();
          const origin = window.location.origin;
          const title = `${postData.title} - Sthefany Sther`;
          const description =
            postData.description ||
            "Leia mais sobre este post no blog da Sthefany Sther";
          const canonical = `${origin}/blog/${postData.slug}`;
          const image = postData.image_path || `${origin}/Logo.png`;

          setMeta({
            title,
            description,
            canonical,
            ogType: "article",
            ogTitle: title,
            ogDescription: description,
            ogImage: image,
            ogUrl: canonical,
            twitterTitle: title,
            twitterDescription: description,
            twitterImage: image,
          });
          to.meta.postData = postData;
          next();
      },
    },
    {
      path: "/admin/login",
      name: "AdminLogin",
      component: () => import("@/views/admin/Login.vue"),
    },
    {
      path: "/admin",
      name: "AdminDashboard",
      component: () => import("@/views/admin/Dashboard.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/posts/new",
      name: "AdminPostNew",
      component: () => import("@/views/admin/PostEditor.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/posts/:id/edit",
      name: "AdminPostEdit",
      component: () => import("@/views/admin/PostEditor.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("@/views/NotFound.vue"),
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);
  const isLoginRoute = to.name === "AdminLogin";

  if (!requiresAuth && !isLoginRoute) {
    next();
    return;
  }

  // getSession() é local (lê o JWT guardado) e barato — filtra quem não tem
  // sessão nenhuma antes de gastar um RPC.
  const { data: { session } } = await supabase.auth.getSession();

  if (requiresAuth && !session) {
    next({ name: "AdminLogin" });
    return;
  }

  // Sessão válida não é permissão. checkIsAdmin() chama o RPC `is_admin`,
  // que é validado no servidor (RLS na tabela admin_users) — não dá para
  // forjar isso no client. Sem isso, qualquer conta autenticada entrava.
  if (requiresAuth && session) {
    const { checkIsAdmin, signOut } = useAuth();
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      await signOut();
      next({ name: "AdminLogin", query: { denied: "1" } });
      return;
    }
  }

  if (isLoginRoute && session) {
    const { checkIsAdmin } = useAuth();
    const isAdmin = await checkIsAdmin();
    if (isAdmin) {
      next({ name: "AdminDashboard" });
      return;
    }
  }

  next();
});

export default router;

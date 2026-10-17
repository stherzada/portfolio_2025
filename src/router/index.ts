import { createRouter, createWebHistory } from "vue-router";
import { useMeta } from "@/composables/useMeta";
import { useAuth } from "@/composables/useAuth";
import supabase from "@/supabase";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/config";

const pageMeta = (title: string, description: string, path: string) => {
  const canonical = `${SITE_URL}${path}`;
  useMeta().setMeta({
    title,
    description,
    canonical,
    ogType: "website",
    ogTitle: title,
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    ogUrl: canonical,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: DEFAULT_OG_IMAGE,
  });
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  },
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("@/views/Home.vue"),
      beforeEnter: () => {
        pageMeta(
          "Sthefany Sther - Software Engineer",
          "Portfolio de Sthefany Sther, Desenvolvedora de Software que curte gestão e análise de dados. Conheça meus projetos e experiências em tecnologia.",
          "/"
        );
      },
    },
    {
      path: "/blog",
      name: "Blog",
      component: () => import("@/views/Blog.vue"),
      beforeEnter: () => {
        pageMeta(
          "Blog - Sthefany Sther",
          "Aqui você pode encontrar meus pensamentos e ideias sobre tecnologia, programação e outros tópicos.",
          "/blog"
        );
      },
    },
    {
      // Post meta is set by BlogPost.vue once the post loads; the server
      // already injected it for crawlers (api/blog-meta.ts).
      path: "/blog/:slug",
      name: "BlogPost",
      component: () => import("@/views/BlogPost.vue"),
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

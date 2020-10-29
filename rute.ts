import { Router } from 'https://deno.land/x/oak/mod.ts';
import { home,signup,kategori,login,logout,posting} from './controller/blog.ts';
const router = new Router();

router
    .get ("/", home)
     .get ("/daftar",signup)
    .post ("/daftar", signup)
    .get("/login", login)
    .post ("/login", login)
    .get("/cek")
    .get("/posting", posting)
    .post("/posting", posting)
    .get("/logout", logout)
    .get ("/kategori/:id", kategori);

export default router;
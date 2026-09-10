import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Match Firebase's dedicated Pocket HTML entry in development and preview too.
function pocketRoute() {
  const middleware=(req,_res,next)=>{
    if (/^\/pocket\/?(?:\?|$)/.test(req.url || '')) req.url=req.url.replace(/^\/pocket\/?/, '/pocket.html');
    next();
  };
  return {name:'pocket-html-route',configureServer(server){server.middlewares.use(middleware);},configurePreviewServer(server){server.middlewares.use(middleware);}};
}
export default defineConfig({
  plugins:[pocketRoute(),react()],
  build:{rollupOptions:{input:{main:'index.html',pocket:'pocket.html'}}},
});

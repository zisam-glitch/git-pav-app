import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    // The root route redirects "/about/" to "/about" itself, permanently (301).
    // The router's own handling would answer with a temporary 307 first.
    trailingSlash: "preserve",
  });
}

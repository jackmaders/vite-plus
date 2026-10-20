// oxlint-disable node/no-top-level-await, react/only-export-components
import type {
  createFileRoute as actualCreateFileRoute,
  createRootRoute as actualCreateRootRoute,
  createRoute as actualCreateRoute,
  createRouter as actualCreateRouter,
  redirect as actualRedirect,
  RouterProvider as actualRouterProvider,
} from "@tanstack/react-router";
import { vi } from "vite-plus/test";

const actual = await vi.importActual<{
  createFileRoute: typeof actualCreateFileRoute;
  createRootRoute: typeof actualCreateRootRoute;
  createRoute: typeof actualCreateRoute;
  createRouter: typeof actualCreateRouter;
  redirect: typeof actualRedirect;
  RouterProvider: typeof actualRouterProvider;
}>("@tanstack/react-router");

function Outlet() {
  return <div>Mocked Child Outlet</div>;
}

const { createFileRoute, createRootRoute, createRoute, createRouter, redirect, RouterProvider } =
  actual;

export {
  Outlet,
  createFileRoute,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  RouterProvider,
};

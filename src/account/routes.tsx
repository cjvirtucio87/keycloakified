import { environment } from "@keycloakify/keycloak-account-ui/environment";
import { Root } from "@keycloakify/keycloak-account-ui/root/Root";
import { ErrorPage } from "@keycloakify/keycloak-account-ui/root/ErrorPage";
import type { RouteObject } from "react-router-dom";
import { PersonalInfoRoute, DeviceActivityRoute, LinkedAccountsRoute, SigningInRoute, GroupsRoute, OrganizationsRoute, ResourcesRoute, ContentRoute, Oid4VciRoute } from "@keycloakify/keycloak-account-ui/routes";

import { Applications } from './Applications'


export const ApplicationsRoute: RouteObject = {
  path: "applications",
  element: <Applications />,
};

export const RootRoute: RouteObject = {
  path: decodeURIComponent(new URL(environment.baseUrl).pathname),
  element: <Root />,
  errorElement: <ErrorPage />,
  children: [
    PersonalInfoRoute,
    DeviceActivityRoute,
    LinkedAccountsRoute,
    SigningInRoute,
    ApplicationsRoute,
    GroupsRoute,
    OrganizationsRoute,
    ResourcesRoute,
    ContentRoute,
    Oid4VciRoute,
  ],
};

export const routes: RouteObject[] = [RootRoute];

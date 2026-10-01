import React from "react";
import { useRole, PERSONAS } from "../context/RoleContext";
import { LandingPage } from "./LandingPage";
import { StudentHomePage } from "./StudentHomePage";
import { IssuerHomePage } from "./IssuerHomePage";
import { EmployerHomePage } from "./EmployerHomePage";

export function HomePage() {
  const { user, currentRole } = useRole();

  if (!user) {
    return <LandingPage />;
  }

  const role = currentRole || user.role;

  if (role === PERSONAS.STUDENT) {
    return <StudentHomePage />;
  }

  if (role === PERSONAS.ISSUER) {
    return <IssuerHomePage />;
  }

  if (role === PERSONAS.EMPLOYER) {
    return <EmployerHomePage />;
  }

  return <LandingPage />;
}

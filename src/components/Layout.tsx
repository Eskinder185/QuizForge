import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <main className="container page-content">{children}</main>;
}

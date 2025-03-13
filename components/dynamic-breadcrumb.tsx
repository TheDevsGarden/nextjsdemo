"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter((segment) => segment !== "");

  const breadcrumbItems = [{ href: "/", label: "Home" }];
  segments.forEach((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    breadcrumbItems.push({
      href,
      label: segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    });
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          return (
            <Fragment key={item.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
